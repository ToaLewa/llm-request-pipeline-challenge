import { findCandidateDoctorsBySkillCodes, type CandidateDoctorPayload } from '../doctors/candidates';
import {
  createDoctorRanking,
  createOpenAIDoctorRankingClient,
  validateDoctorRanking,
  type DoctorRanking,
  type DoctorRankingClient,
} from '../inference/doctor-ranking';
import { parseRoutingDecision, type RoutingDecision } from '../inference/routing';
import {
  createOpenAISkillsRankingClient,
  createSkillsRanking,
  validateSkillsRanking,
  type RankedSkill,
  type SkillsRanking,
  type SkillsRankingClient,
} from '../inference/skills-ranking';
import { getPrisma } from '../database/client';
import { listAvailableSkills, type AvailableSkill } from '../skills/skills.service';

type WorkflowRequestRecord = {
  id: number;
  rawRequest: string;
};

type WorkflowTaskRecord = {
  id: number;
  requestId: number | null;
  taskType: string;
  sequence: number;
  status: string;
  input: unknown;
  output: unknown;
  reason: string | null;
};

type WorkflowRecord = {
  id: number;
  requests: WorkflowRequestRecord[];
  tasks: WorkflowTaskRecord[];
};

type WorkflowTaskCreateData = {
  workflowId: number;
  requestId?: number | null;
  taskType: string;
  sequence: number;
  status: string;
  input: unknown;
  output: unknown;
  reason: string | null;
};

type DoctorAssignmentTransactionClient = {
  workflowTask: {
    create(args: { data: WorkflowTaskCreateData }): Promise<WorkflowTaskRecord>;
  };
  workflow: {
    update(args: { where: { id: number }; data: { status: string } }): Promise<{ id: number; status: string }>;
  };
};

export type DoctorAssignmentWorkflowClient = {
  workflow: {
    findUnique(args: {
      where: { id: number };
      include: {
        requests: { orderBy: { createdAt: 'asc' } };
        tasks: { orderBy: [{ sequence: 'asc' }, { createdAt: 'asc' }] };
      };
    }): Promise<WorkflowRecord | null>;
  };
  $transaction<T>(handler: (tx: DoctorAssignmentTransactionClient) => Promise<T>): Promise<T>;
};

export type ProcessDoctorAssignmentWorkflowOptions = {
  client?: DoctorAssignmentWorkflowClient;
  skillsRankingClient?: SkillsRankingClient;
  doctorRankingClient?: DoctorRankingClient;
  loadAvailableSkills?: () => Promise<AvailableSkill[]>;
  findCandidateDoctors?: (skillCodes: string[]) => Promise<CandidateDoctorPayload[]>;
};

export type DoctorAssignmentWorkflowResult = {
  status: 'skipped' | 'assigned' | 'unassignable' | 'needs_review';
  workflowId: number;
};

type FinalAssignment = {
  status: 'completed' | 'unassignable' | 'needs_review';
  output: {
    assignedDoctorId: number | null;
    assignedDoctorName: string | null;
    assignmentReason: string | null;
    rankingConfidence: number | null;
    unassignableReason: string | null;
  };
  reason: string | null;
};

export async function processDoctorAssignmentWorkflow(
  workflowId: number,
  options: ProcessDoctorAssignmentWorkflowOptions = {},
): Promise<DoctorAssignmentWorkflowResult> {
  const client: DoctorAssignmentWorkflowClient = options.client ?? (getPrisma() as unknown as DoctorAssignmentWorkflowClient);
  const workflow = await loadWorkflow(workflowId, client);
  const routingTask = workflow.tasks.find((task) => task.taskType === 'routing_decision');

  if (!routingTask) {
    throw new Error(`Workflow ${workflowId} does not have a routing_decision task.`);
  }

  const routingDecision = parseRoutingDecision(routingTask.output);

  if (routingDecision.route !== 'doctor_assignment') {
    return { status: 'skipped', workflowId };
  }

  const request = workflow.requests.find((workflowRequest) => workflowRequest.id === routingTask.requestId) ?? workflow.requests[0];

  if (!request) {
    throw new Error(`Workflow ${workflowId} does not have an initial request.`);
  }

  const rawRequest = request.rawRequest;
  const availableSkills = await (options.loadAvailableSkills ?? (() => listAvailableSkills()))();
  const skillsRankingClient = options.skillsRankingClient ?? createOpenAISkillsRankingClient();
  const skillsRankingResult = await rankAndPersistSkills({
    client,
    workflowId,
    requestId: request.id,
    rawRequest,
    routingDecision,
    availableSkills,
    skillsRankingClient,
  });

  if (skillsRankingResult.status === 'needs_review') {
    await updateWorkflowStatus(client, workflowId, 'needs_review');
    return { status: 'needs_review', workflowId };
  }

  if (skillsRankingResult.ranking.rankedSkills.length === 0) {
    await persistUnassignableWorkflow({
      client,
      workflowId,
      requestId: request.id,
      rawRequest,
      routingDecision,
      rankedSkills: [],
      candidateDoctors: [],
      reason: 'No canonical skills were relevant to the request.',
    });
    return { status: 'unassignable', workflowId };
  }

  const skillCodes = skillsRankingResult.ranking.rankedSkills.map((skill) => skill.skillCode);
  const candidateDoctors = await (options.findCandidateDoctors ?? ((codes) => findCandidateDoctorsBySkillCodes(codes)))(skillCodes);

  if (candidateDoctors.length === 0) {
    await persistUnassignableWorkflow({
      client,
      workflowId,
      requestId: request.id,
      rawRequest,
      routingDecision,
      rankedSkills: skillsRankingResult.ranking.rankedSkills,
      candidateDoctors,
      reason: 'No active available doctors matched the ranked canonical skills.',
    });
    return { status: 'unassignable', workflowId };
  }

  const doctorRankingClient = options.doctorRankingClient ?? createOpenAIDoctorRankingClient();
  const doctorRankingResult = await rankDoctors({
    rawRequest,
    routingDecision,
    rankedSkills: skillsRankingResult.ranking.rankedSkills,
    candidateDoctors,
    doctorRankingClient,
  });

  const doctorRankingTask = await client.$transaction(async (tx) => tx.workflowTask.create({
    data: {
      workflowId,
      requestId: request.id,
      taskType: 'doctor_ranking',
      sequence: 3,
      status: doctorRankingResult.status,
      input: {
        rawRequest,
        routingDecision,
        rankedSkills: skillsRankingResult.ranking.rankedSkills,
        candidateDoctors,
      },
      output: doctorRankingResult.ranking,
      reason: doctorRankingResult.reason,
    },
  }));

  const finalAssignment = toFinalAssignment(doctorRankingResult.ranking, candidateDoctors, doctorRankingResult.status);
  const workflowStatus = finalAssignment.status === 'completed' ? 'assigned' : finalAssignment.status;

  await client.$transaction(async (tx) => {
    const doctorAssignmentTask = await tx.workflowTask.create({
      data: {
        workflowId,
        requestId: request.id,
        taskType: 'doctor_assignment',
        sequence: 4,
        status: finalAssignment.status,
        input: {
          doctorRankingTaskId: doctorRankingTask.id,
          selectedDoctorId: doctorRankingResult.ranking.selectedDoctorId,
        },
        output: finalAssignment.output,
        reason: finalAssignment.reason,
      },
    });

    if (finalAssignment.status === 'unassignable') {
      await tx.workflowTask.create({
        data: {
          workflowId,
          requestId: request.id,
          taskType: 'unknown_human_review',
          sequence: 5,
          status: 'required',
          input: {
            failedTaskId: doctorAssignmentTask.id,
            failedTaskType: doctorAssignmentTask.taskType,
            doctorAssignmentStatus: finalAssignment.status,
          },
          output: {
            route: 'unknown_human_review',
            reason: finalAssignment.reason ?? 'Doctor assignment failed and requires human review.',
          },
          reason: finalAssignment.reason ?? 'Doctor assignment failed and requires human review.',
        },
      });
    }

    await tx.workflow.update({ where: { id: workflowId }, data: { status: workflowStatus } });
  });

  return { status: workflowStatus as DoctorAssignmentWorkflowResult['status'], workflowId };
}

async function loadWorkflow(workflowId: number, client: DoctorAssignmentWorkflowClient): Promise<WorkflowRecord> {
  const workflow = await client.workflow.findUnique({
    where: { id: workflowId },
    include: {
      requests: { orderBy: { createdAt: 'asc' } },
      tasks: { orderBy: [{ sequence: 'asc' }, { createdAt: 'asc' }] },
    },
  });

  if (!workflow) {
    throw new Error(`Workflow ${workflowId} was not found.`);
  }

  return workflow;
}

async function rankAndPersistSkills(args: {
  client: DoctorAssignmentWorkflowClient;
  workflowId: number;
  requestId: number;
  rawRequest: string;
  routingDecision: RoutingDecision;
  availableSkills: AvailableSkill[];
  skillsRankingClient: SkillsRankingClient;
}): Promise<{ status: 'completed'; ranking: SkillsRanking } | { status: 'needs_review'; ranking: SkillsRanking }> {
  let ranking: SkillsRanking;
  let status: 'completed' | 'needs_review' = 'completed';

  try {
    ranking = validateSkillsRanking(
      await createSkillsRanking(
        {
          rawRequest: args.rawRequest,
          routingDecision: args.routingDecision,
          availableSkills: args.availableSkills,
        },
        args.skillsRankingClient,
      ),
      args.availableSkills,
    );
  } catch (error) {
    status = 'needs_review';
    ranking = {
      rankedSkills: [],
      confidence: 0,
      reason: error instanceof Error ? error.message : 'Skill ranking validation failed.',
    };
  }

  await args.client.$transaction(async (tx) => tx.workflowTask.create({
    data: {
      workflowId: args.workflowId,
      requestId: args.requestId,
      taskType: 'skills_ranking',
      sequence: 2,
      status,
      input: {
        rawRequest: args.rawRequest,
        routingDecision: args.routingDecision,
        availableSkills: args.availableSkills,
      },
      output: ranking,
      reason: ranking.reason,
    },
  }));

  return { status, ranking };
}

async function rankDoctors(args: {
  rawRequest: string;
  routingDecision: RoutingDecision;
  rankedSkills: RankedSkill[];
  candidateDoctors: CandidateDoctorPayload[];
  doctorRankingClient: DoctorRankingClient;
}): Promise<{ status: 'completed' | 'unassignable' | 'needs_review'; ranking: DoctorRanking; reason: string | null }> {
  try {
    const ranking = validateDoctorRanking(
      await createDoctorRanking(
        {
          rawRequest: args.rawRequest,
          routingDecision: args.routingDecision,
          rankedSkills: args.rankedSkills,
          candidateDoctors: args.candidateDoctors,
        },
        args.doctorRankingClient,
      ),
      args.candidateDoctors,
    );
    const status = ranking.unassignable ? 'unassignable' : 'completed';

    return {
      status,
      ranking,
      reason: ranking.assignmentReason || ranking.unassignableReason,
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Doctor ranking validation failed.';

    return {
      status: 'needs_review',
      ranking: {
        selectedDoctorId: null,
        confidence: 0,
        assignmentReason: '',
        rankedCandidates: [],
        unassignable: false,
        unassignableReason: reason,
      },
      reason,
    };
  }
}

async function persistUnassignableWorkflow(args: {
  client: DoctorAssignmentWorkflowClient;
  workflowId: number;
  requestId: number;
  rawRequest: string;
  routingDecision: RoutingDecision;
  rankedSkills: RankedSkill[];
  candidateDoctors: CandidateDoctorPayload[];
  reason: string;
}): Promise<void> {
  await args.client.$transaction(async (tx) => {
    const doctorRankingTask = await tx.workflowTask.create({
      data: {
        workflowId: args.workflowId,
        requestId: args.requestId,
        taskType: 'doctor_ranking',
        sequence: 3,
        status: 'unassignable',
        input: {
          rawRequest: args.rawRequest,
          routingDecision: args.routingDecision,
          rankedSkills: args.rankedSkills,
          candidateDoctors: args.candidateDoctors,
        },
        output: {
          selectedDoctorId: null,
          confidence: 1,
          assignmentReason: '',
          rankedCandidates: [],
          unassignable: true,
          unassignableReason: args.reason,
        },
        reason: args.reason,
      },
    });

    const doctorAssignmentTask = await tx.workflowTask.create({
      data: {
        workflowId: args.workflowId,
        requestId: args.requestId,
        taskType: 'doctor_assignment',
        sequence: 4,
        status: 'unassignable',
        input: {
          doctorRankingTaskId: doctorRankingTask.id,
          selectedDoctorId: null,
        },
        output: {
          assignedDoctorId: null,
          assignedDoctorName: null,
          assignmentReason: null,
          rankingConfidence: 1,
          unassignableReason: args.reason,
        },
        reason: args.reason,
      },
    });

    await tx.workflowTask.create({
      data: {
        workflowId: args.workflowId,
        requestId: args.requestId,
        taskType: 'unknown_human_review',
        sequence: 5,
        status: 'required',
        input: {
          failedTaskId: doctorAssignmentTask.id,
          failedTaskType: doctorAssignmentTask.taskType,
          doctorAssignmentStatus: doctorAssignmentTask.status,
        },
        output: {
          route: 'unknown_human_review',
          reason: args.reason,
        },
        reason: args.reason,
      },
    });

    await tx.workflow.update({ where: { id: args.workflowId }, data: { status: 'unassignable' } });
  });
}

async function updateWorkflowStatus(
  client: DoctorAssignmentWorkflowClient,
  workflowId: number,
  status: 'needs_review',
): Promise<void> {
  await client.$transaction(async (tx) => {
    await tx.workflow.update({ where: { id: workflowId }, data: { status } });
  });
}

function toFinalAssignment(
  ranking: DoctorRanking,
  candidateDoctors: CandidateDoctorPayload[],
  doctorRankingStatus: 'completed' | 'unassignable' | 'needs_review',
): FinalAssignment {
  if (doctorRankingStatus === 'needs_review') {
    return {
      status: 'needs_review',
      output: {
        assignedDoctorId: null,
        assignedDoctorName: null,
        assignmentReason: null,
        rankingConfidence: ranking.confidence,
        unassignableReason: ranking.unassignableReason,
      },
      reason: ranking.unassignableReason,
    };
  }

  if (doctorRankingStatus === 'unassignable') {
    return {
      status: 'unassignable',
      output: {
        assignedDoctorId: null,
        assignedDoctorName: null,
        assignmentReason: null,
        rankingConfidence: ranking.confidence,
        unassignableReason: ranking.unassignableReason,
      },
      reason: ranking.unassignableReason,
    };
  }

  const assignedDoctor = candidateDoctors.find((doctor) => doctor.id === ranking.selectedDoctorId);

  return {
    status: 'completed',
    output: {
      assignedDoctorId: ranking.selectedDoctorId,
      assignedDoctorName: assignedDoctor?.name ?? null,
      assignmentReason: ranking.assignmentReason,
      rankingConfidence: ranking.confidence,
      unassignableReason: null,
    },
    reason: ranking.assignmentReason,
  };
}
