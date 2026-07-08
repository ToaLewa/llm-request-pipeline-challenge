import { findCandidateDoctorsBySkillCodes, type CandidateDoctorPayload } from '../team/candidates';
import {
  createAssignmentSummary,
  createOpenAIAssignmentSummaryClient,
  type AssignmentSummaryClient,
} from '../inference/assignment-summary';
import {
  createDoctorRanking,
  createOpenAIDoctorRankingClient,
  validateDoctorRanking,
  type DoctorRanking,
  type DoctorRankingClient,
} from '../inference/doctor-ranking';
import { parseRoutingDecision, type RoutingDecision } from '../inference/routing';
import {
  completeDoctorAssignmentWorkflow,
  createDoctorRankingTask,
  createSkillsRankingTask,
  loadDoctorAssignmentWorkflow,
  markDoctorAssignmentWorkflowUnassignable,
  updateDoctorAssignmentWorkflowStatus,
  type DoctorAssignmentWorkflowClient,
  type DoctorAssignmentWorkflowStatus,
  type WorkflowTaskRecord,
} from '../database/doctor-assignment.queries';
import {
  createOpenAISkillsRankingClient,
  createSkillsRanking,
  validateSkillsRanking,
  type RankedSkill,
  type SkillsRanking,
  type SkillsRankingClient,
} from '../inference/skills-ranking';
import { listAvailableSkills, type AvailableSkill } from '../skills/skills.service';
import { createHumanReviewTask } from './human-review.service';

export type { DoctorAssignmentWorkflowClient } from '../database/doctor-assignment.queries';

export type ProcessDoctorAssignmentWorkflowOptions = {
  client?: DoctorAssignmentWorkflowClient;
  skillsRankingClient?: SkillsRankingClient;
  doctorRankingClient?: DoctorRankingClient;
  assignmentSummaryClient?: AssignmentSummaryClient;
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
  const client = options.client;
  const workflow = await loadDoctorAssignmentWorkflow(workflowId, client);
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
    await updateDoctorAssignmentWorkflowStatus({ client, workflowId, status: 'needs_review' });
    return { status: 'needs_review', workflowId };
  }

  if (skillsRankingResult.ranking.rankedSkills.length === 0) {
    const doctorAssignmentTask = await markDoctorAssignmentWorkflowUnassignable({
      client,
      workflowId,
      requestId: request.id,
      rawRequest,
      routingDecision,
      rankedSkills: [],
      candidateDoctors: [],
      reason: 'No canonical skills were relevant to the request.',
    });
    await createDoctorAssignmentHumanReviewTask({
      client,
      workflowId,
      requestId: request.id,
      doctorAssignmentTask,
      reason: 'No canonical skills were relevant to the request.',
    });
    return { status: 'unassignable', workflowId };
  }

  const skillCodes = skillsRankingResult.ranking.rankedSkills.map((skill) => skill.skillCode);
  const candidateDoctors = await (options.findCandidateDoctors ?? ((codes) => findCandidateDoctorsBySkillCodes(codes)))(skillCodes);

  if (candidateDoctors.length === 0) {
    const reason = 'No active available doctors matched the ranked canonical skills.';
    const doctorAssignmentTask = await markDoctorAssignmentWorkflowUnassignable({
      client,
      workflowId,
      requestId: request.id,
      rawRequest,
      routingDecision,
      rankedSkills: skillsRankingResult.ranking.rankedSkills,
      candidateDoctors,
      reason,
    });
    await createDoctorAssignmentHumanReviewTask({
      client,
      workflowId,
      requestId: request.id,
      doctorAssignmentTask,
      reason,
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

  const doctorRankingTask = await createDoctorRankingTask({
    client,
    workflowId,
    requestId: request.id,
    rawRequest,
    routingDecision,
    rankedSkills: skillsRankingResult.ranking.rankedSkills,
    candidateDoctors,
    status: doctorRankingResult.status,
    ranking: doctorRankingResult.ranking,
    reason: doctorRankingResult.reason,
  });

  const finalAssignment = toFinalAssignment(doctorRankingResult.ranking, candidateDoctors, doctorRankingResult.status);
  const workflowStatus: DoctorAssignmentWorkflowStatus = finalAssignment.status === 'completed' ? 'assigned' : finalAssignment.status;
  const assignmentSummary = finalAssignment.status === 'completed' && finalAssignment.output.assignedDoctorId !== null
    ? await createAssignmentSummary(
      {
        rawRequest,
        workflowContext: buildAssignmentSummaryContext(workflow.tasks, [
          skillsRankingResult.task,
          {
            ...doctorRankingTask,
            output: doctorRankingResult.ranking,
            reason: doctorRankingResult.reason,
          },
          {
            id: 0,
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
        ]),
        assignedDoctor: {
          id: finalAssignment.output.assignedDoctorId,
          name: finalAssignment.output.assignedDoctorName,
        },
      },
      options.assignmentSummaryClient ?? createOpenAIAssignmentSummaryClient(),
    )
    : null;

  const doctorAssignmentTask = await completeDoctorAssignmentWorkflow({
    client,
    workflowId,
    requestId: request.id,
    doctorRankingTaskId: doctorRankingTask.id,
    selectedDoctorId: doctorRankingResult.ranking.selectedDoctorId,
    finalAssignmentStatus: finalAssignment.status,
    finalAssignmentOutput: finalAssignment.output,
    finalAssignmentReason: finalAssignment.reason,
    workflowStatus,
    assignmentSummary: assignmentSummary?.summary ?? null,
    assignedDoctorId: finalAssignment.output.assignedDoctorId,
  });

  if (finalAssignment.status === 'unassignable') {
    await createDoctorAssignmentHumanReviewTask({
      client,
      workflowId,
      requestId: request.id,
      doctorAssignmentTask,
      reason: finalAssignment.reason ?? 'Doctor assignment failed and requires human review.',
    });
  }

  return { status: workflowStatus, workflowId };
}

async function createDoctorAssignmentHumanReviewTask(args: {
  client?: DoctorAssignmentWorkflowClient;
  workflowId: number;
  requestId: number;
  doctorAssignmentTask: WorkflowTaskRecord;
  reason: string;
}): Promise<void> {
  await createHumanReviewTask({
    client: args.client,
    workflowId: args.workflowId,
    requestId: args.requestId,
    sequence: 5,
    failedTask: args.doctorAssignmentTask,
    failureContext: { doctorAssignmentStatus: args.doctorAssignmentTask.status },
    reason: args.reason,
  });
}

function buildAssignmentSummaryContext(
  existingTasks: WorkflowTaskRecord[],
  newTasks: WorkflowTaskRecord[],
): Array<{ taskType: string; status: string; reason: string | null; output: unknown }> {
  return [...existingTasks, ...newTasks]
    .sort((left, right) => left.sequence - right.sequence)
    .map((task) => ({
      taskType: task.taskType,
      status: task.status,
      reason: task.reason,
      output: task.output,
    }));
}

async function rankAndPersistSkills(args: {
  client?: DoctorAssignmentWorkflowClient;
  workflowId: number;
  requestId: number;
  rawRequest: string;
  routingDecision: RoutingDecision;
  availableSkills: AvailableSkill[];
  skillsRankingClient: SkillsRankingClient;
}): Promise<
  | { status: 'completed'; ranking: SkillsRanking; task: WorkflowTaskRecord }
  | { status: 'needs_review'; ranking: SkillsRanking; task: WorkflowTaskRecord }
> {
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

  const task = await createSkillsRankingTask({
    client: args.client,
    workflowId: args.workflowId,
    requestId: args.requestId,
    rawRequest: args.rawRequest,
    routingDecision: args.routingDecision,
    availableSkills: args.availableSkills,
    status,
    ranking,
    reason: ranking.reason,
  });

  return { status, ranking, task };
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
