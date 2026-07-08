import { getPrisma } from './client';
import type { WorkflowAction } from '../inference/workflow-action';
import type { CandidateDoctorPayload } from '../team/candidates';

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
  status: string;
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

type WorkflowActionTransactionClient = {
  workflowTask: {
    create(args: { data: WorkflowTaskCreateData }): Promise<WorkflowTaskRecord>;
  };
  assignment: {
    create(args: { data: { teamMemberId: number; workflowTaskId: number; summary: string } }): Promise<{ id: number }>;
  };
  workflow: {
    update(args: { where: { id: number }; data: { status: string } }): Promise<{ id: number; status: string }>;
  };
};

export type WorkflowActionServiceClient = {
  workflow: {
    findUnique(args: {
      where: { id: number };
      include: {
        requests: { orderBy: { createdAt: 'asc' } };
        tasks: { orderBy: [{ sequence: 'asc' }, { createdAt: 'asc' }] };
      };
    }): Promise<WorkflowRecord | null>;
  };
  $transaction<T>(handler: (tx: WorkflowActionTransactionClient) => Promise<T>): Promise<T>;
};

export type PreviousAssignment = {
  taskId: number | null;
  doctorId: number | null;
  doctorName: string | null;
};

export async function loadWorkflowForAction(
  workflowId: number,
  client: WorkflowActionServiceClient = defaultWorkflowActionClient(),
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

export async function createWorkflowActionTask(args: {
  client?: WorkflowActionServiceClient;
  workflowId: number;
  requestId: number | null;
  sequence: number;
  status: 'completed' | 'unsupported' | 'needs_review';
  message: string;
  output: WorkflowAction;
  reason: string;
}): Promise<WorkflowTaskRecord> {
  const client = args.client ?? defaultWorkflowActionClient();

  return client.$transaction(async (tx) => tx.workflowTask.create({
    data: {
      workflowId: args.workflowId,
      requestId: args.requestId,
      taskType: 'workflow_action',
      sequence: args.sequence,
      status: args.status,
      input: { message: args.message },
      output: args.output,
      reason: args.reason,
    },
  }));
}

export async function completeDoctorReassignmentWorkflow(args: {
  client?: WorkflowActionServiceClient;
  workflowId: number;
  requestId: number | null;
  actionSequence: number;
  resultSequence: number;
  message: string;
  action: WorkflowAction;
  requestedDoctorName: string;
  previousAssignment: PreviousAssignment;
  candidateDoctors: CandidateDoctorPayload[];
  assignedDoctor: CandidateDoctorPayload;
  selectionReason: string;
  selectionConfidence: number;
  assignmentSummary: string;
}): Promise<{ actionTask: WorkflowTaskRecord; reassignmentTask: WorkflowTaskRecord }> {
  const client = args.client ?? defaultWorkflowActionClient();

  return client.$transaction(async (tx) => {
    const actionTask = await tx.workflowTask.create({
      data: {
        workflowId: args.workflowId,
        requestId: args.requestId,
        taskType: 'workflow_action',
        sequence: args.actionSequence,
        status: 'completed',
        input: { message: args.message },
        output: args.action,
        reason: args.action.reason,
      },
    });
    const reassignmentTask = await tx.workflowTask.create({
      data: {
        workflowId: args.workflowId,
        requestId: args.requestId,
        taskType: 'doctor_reassignment',
        sequence: args.resultSequence,
        status: 'completed',
        input: {
          actionTaskId: actionTask.id,
          message: args.message,
          requestedDoctorName: args.requestedDoctorName,
          previousAssignmentTaskId: args.previousAssignment.taskId,
          previousDoctorId: args.previousAssignment.doctorId,
          previousDoctorName: args.previousAssignment.doctorName,
          candidateDoctors: args.candidateDoctors,
        },
        output: {
          assignedDoctorId: args.assignedDoctor.id,
          assignedDoctorName: args.assignedDoctor.name,
          assignmentReason: args.selectionReason,
          confidence: args.selectionConfidence,
        },
        reason: args.selectionReason,
      },
    });

    await tx.assignment.create({
      data: {
        teamMemberId: args.assignedDoctor.id,
        workflowTaskId: reassignmentTask.id,
        summary: args.assignmentSummary,
      },
    });
    await tx.workflow.update({ where: { id: args.workflowId }, data: { status: 'assigned' } });

    return { actionTask, reassignmentTask };
  });
}

function defaultWorkflowActionClient(): WorkflowActionServiceClient {
  return getPrisma() as unknown as WorkflowActionServiceClient;
}
