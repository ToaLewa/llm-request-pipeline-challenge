import { getPrisma } from './client';

export type WorkflowRequestRecord = {
  id: number;
  rawRequest: string;
};

export type WorkflowTaskRecord = {
  id: number;
  requestId: number | null;
  taskType: string;
  sequence: number;
  status: string;
  input: unknown;
  output: unknown;
  reason: string | null;
};

export type WorkflowRecord = {
  id: number;
  requests: WorkflowRequestRecord[];
  tasks: WorkflowTaskRecord[];
};

export type WorkflowTaskCreateData = {
  workflowId: number;
  requestId?: number | null;
  taskType: string;
  sequence: number;
  status: string;
  input: unknown;
  output: unknown;
  reason: string | null;
};

type AssignmentCreateData = {
  teamMemberId: number;
  workflowTaskId: number;
  summary: string;
};

type DoctorAssignmentTransactionClient = {
  workflowTask: {
    create(args: { data: WorkflowTaskCreateData }): Promise<WorkflowTaskRecord>;
  };
  assignment: {
    create(args: { data: AssignmentCreateData }): Promise<{ id: number }>;
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

export type DoctorAssignmentWorkflowStatus = 'assigned' | 'unassignable' | 'needs_review';

export type CreateSkillsRankingTaskArgs = {
  client?: DoctorAssignmentWorkflowClient;
  workflowId: number;
  requestId: number;
  rawRequest: string;
  routingDecision: unknown;
  availableSkills: unknown;
  status: string;
  ranking: unknown;
  reason: string | null;
};

export type CreateDoctorRankingTaskArgs = {
  client?: DoctorAssignmentWorkflowClient;
  workflowId: number;
  requestId: number;
  rawRequest: string;
  routingDecision: unknown;
  rankedSkills: unknown;
  candidateDoctors: unknown;
  status: string;
  ranking: unknown;
  reason: string | null;
};

export type CompleteDoctorAssignmentWorkflowArgs = {
  client?: DoctorAssignmentWorkflowClient;
  workflowId: number;
  requestId: number;
  doctorRankingTaskId: number;
  selectedDoctorId: number | null;
  finalAssignmentStatus: 'completed' | 'unassignable' | 'needs_review';
  finalAssignmentOutput: unknown;
  finalAssignmentReason: string | null;
  workflowStatus: DoctorAssignmentWorkflowStatus;
  assignmentSummary: string | null;
  assignedDoctorId: number | null;
};

export type MarkDoctorAssignmentWorkflowUnassignableArgs = {
  client?: DoctorAssignmentWorkflowClient;
  workflowId: number;
  requestId: number;
  rawRequest: string;
  routingDecision: unknown;
  rankedSkills: unknown;
  candidateDoctors: unknown;
  reason: string;
};

export async function loadDoctorAssignmentWorkflow(
  workflowId: number,
  client: DoctorAssignmentWorkflowClient = defaultDoctorAssignmentWorkflowClient(),
): Promise<WorkflowRecord> {
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

export async function createSkillsRankingTask(args: CreateSkillsRankingTaskArgs): Promise<WorkflowTaskRecord> {
  const client = args.client ?? defaultDoctorAssignmentWorkflowClient();

  return client.$transaction(async (tx) => tx.workflowTask.create({
    data: {
      workflowId: args.workflowId,
      requestId: args.requestId,
      taskType: 'skills_ranking',
      sequence: 2,
      status: args.status,
      input: {
        rawRequest: args.rawRequest,
        routingDecision: args.routingDecision,
        availableSkills: args.availableSkills,
      },
      output: args.ranking,
      reason: args.reason,
    },
  }));
}

export async function createDoctorRankingTask(args: CreateDoctorRankingTaskArgs): Promise<WorkflowTaskRecord> {
  const client = args.client ?? defaultDoctorAssignmentWorkflowClient();

  return client.$transaction(async (tx) => tx.workflowTask.create({
    data: {
      workflowId: args.workflowId,
      requestId: args.requestId,
      taskType: 'doctor_ranking',
      sequence: 3,
      status: args.status,
      input: {
        rawRequest: args.rawRequest,
        routingDecision: args.routingDecision,
        rankedSkills: args.rankedSkills,
        candidateDoctors: args.candidateDoctors,
      },
      output: args.ranking,
      reason: args.reason,
    },
  }));
}

export async function completeDoctorAssignmentWorkflow(args: CompleteDoctorAssignmentWorkflowArgs): Promise<void> {
  const client = args.client ?? defaultDoctorAssignmentWorkflowClient();

  await client.$transaction(async (tx) => {
    const doctorAssignmentTask = await tx.workflowTask.create({
      data: {
        workflowId: args.workflowId,
        requestId: args.requestId,
        taskType: 'doctor_assignment',
        sequence: 4,
        status: args.finalAssignmentStatus,
        input: {
          doctorRankingTaskId: args.doctorRankingTaskId,
          selectedDoctorId: args.selectedDoctorId,
        },
        output: args.finalAssignmentOutput,
        reason: args.finalAssignmentReason,
      },
    });

    if (args.assignmentSummary && args.assignedDoctorId !== null) {
      await tx.assignment.create({
        data: {
          teamMemberId: args.assignedDoctorId,
          workflowTaskId: doctorAssignmentTask.id,
          summary: args.assignmentSummary,
        },
      });
    }

    if (args.finalAssignmentStatus === 'unassignable') {
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
            doctorAssignmentStatus: args.finalAssignmentStatus,
          },
          output: {
            route: 'unknown_human_review',
            reason: args.finalAssignmentReason ?? 'Doctor assignment failed and requires human review.',
          },
          reason: args.finalAssignmentReason ?? 'Doctor assignment failed and requires human review.',
        },
      });
    }

    await tx.workflow.update({ where: { id: args.workflowId }, data: { status: args.workflowStatus } });
  });
}

export async function markDoctorAssignmentWorkflowUnassignable(args: MarkDoctorAssignmentWorkflowUnassignableArgs): Promise<void> {
  const client = args.client ?? defaultDoctorAssignmentWorkflowClient();

  await client.$transaction(async (tx) => {
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

export async function updateDoctorAssignmentWorkflowStatus(args: {
  client?: DoctorAssignmentWorkflowClient;
  workflowId: number;
  status: DoctorAssignmentWorkflowStatus;
}): Promise<void> {
  const client = args.client ?? defaultDoctorAssignmentWorkflowClient();

  await client.$transaction(async (tx) => {
    await tx.workflow.update({ where: { id: args.workflowId }, data: { status: args.status } });
  });
}

function defaultDoctorAssignmentWorkflowClient(): DoctorAssignmentWorkflowClient {
  return getPrisma() as unknown as DoctorAssignmentWorkflowClient;
}
