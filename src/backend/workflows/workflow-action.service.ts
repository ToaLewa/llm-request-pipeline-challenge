import { findCandidateDoctorsByName, type CandidateDoctorPayload } from '../doctors/candidates';
import { getPrisma } from '../database/client';
import {
  createDoctorReassignmentSelection,
  createOpenAIWorkflowActionClient,
  createWorkflowAction,
  validateDoctorReassignmentSelection,
  type DoctorReassignmentSelectionClient,
  type WorkflowAction,
  type WorkflowActionClient,
  type WorkflowActionContext,
} from '../inference/workflow-action';

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
    create(args: { data: { doctorId: number; workflowTaskId: number; summary: string } }): Promise<{ id: number }>;
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

export type ProcessWorkflowActionOptions = {
  client?: WorkflowActionServiceClient;
  workflowActionClient?: WorkflowActionClient;
  doctorSelectionClient?: DoctorReassignmentSelectionClient;
  findDoctorsByName?: (name: string) => Promise<CandidateDoctorPayload[]>;
};

export type ProcessWorkflowActionResult = {
  workflowId: number;
  actionTaskId: number;
  resultTaskId: number | null;
  action: WorkflowAction['action'];
  status: 'completed' | 'unsupported' | 'needs_review';
  message: string;
};

type PreviousAssignment = {
  taskId: number | null;
  doctorId: number | null;
  doctorName: string | null;
};

export async function processWorkflowAction(
  workflowId: number,
  message: string,
  options: ProcessWorkflowActionOptions = {},
): Promise<ProcessWorkflowActionResult> {
  const normalizedMessage = message.trim();

  if (!normalizedMessage) {
    throw new Error('message is required.');
  }

  const client: WorkflowActionServiceClient = options.client ?? (getPrisma() as unknown as WorkflowActionServiceClient);
  const workflow = await loadWorkflow(workflowId, client);
  const workflowContext = toWorkflowActionContext(workflow);
  const actionClient = options.workflowActionClient ?? createOpenAIWorkflowActionClient();
  const action = await createWorkflowAction({ message: normalizedMessage, workflowContext }, actionClient);

  if (action.action !== 'reassign_doctor') {
    return persistUnsupportedAction({ client, workflow, message: normalizedMessage, action });
  }

  return processDoctorReassignment({
    client,
    workflow,
    workflowContext,
    message: normalizedMessage,
    action,
    doctorSelectionClient: options.doctorSelectionClient ?? createOpenAIWorkflowActionClient(),
    findDoctorsByName: options.findDoctorsByName ?? ((name) => findCandidateDoctorsByName(name)),
  });
}

async function loadWorkflow(workflowId: number, client: WorkflowActionServiceClient): Promise<WorkflowRecord> {
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

async function persistUnsupportedAction(args: {
  client: WorkflowActionServiceClient;
  workflow: WorkflowRecord;
  message: string;
  action: WorkflowAction;
}): Promise<ProcessWorkflowActionResult> {
  const actionTask = await args.client.$transaction(async (tx) => tx.workflowTask.create({
    data: {
      workflowId: args.workflow.id,
      requestId: args.workflow.requests[0]?.id ?? null,
      taskType: 'workflow_action',
      sequence: nextSequence(args.workflow.tasks),
      status: 'unsupported',
      input: { message: args.message },
      output: args.action,
      reason: args.action.reason,
    },
  }));

  return {
    workflowId: args.workflow.id,
    actionTaskId: actionTask.id,
    resultTaskId: null,
    action: args.action.action,
    status: 'unsupported',
    message: 'This workflow action is not implemented yet.',
  };
}

async function processDoctorReassignment(args: {
  client: WorkflowActionServiceClient;
  workflow: WorkflowRecord;
  workflowContext: WorkflowActionContext;
  message: string;
  action: WorkflowAction;
  doctorSelectionClient: DoctorReassignmentSelectionClient;
  findDoctorsByName: (name: string) => Promise<CandidateDoctorPayload[]>;
}): Promise<ProcessWorkflowActionResult> {
  const requestedDoctorName = args.action.requestedAssigneeName?.trim() ?? '';

  if (!requestedDoctorName) {
    const actionTask = await persistReviewAction(args.client, args.workflow, args.message, args.action, 'No doctor name was found in the workflow action.');

    return {
      workflowId: args.workflow.id,
      actionTaskId: actionTask.id,
      resultTaskId: null,
      action: args.action.action,
      status: 'needs_review',
      message: 'No doctor name was found in the action.',
    };
  }

  const candidateDoctors = await args.findDoctorsByName(requestedDoctorName);

  if (candidateDoctors.length === 0) {
    const actionTask = await persistReviewAction(args.client, args.workflow, args.message, args.action, `No active available doctors matched ${requestedDoctorName}.`);

    return {
      workflowId: args.workflow.id,
      actionTaskId: actionTask.id,
      resultTaskId: null,
      action: args.action.action,
      status: 'needs_review',
      message: `No active available doctors matched ${requestedDoctorName}.`,
    };
  }

  let selection;
  try {
    selection = validateDoctorReassignmentSelection(
      await createDoctorReassignmentSelection({
        message: args.message,
        requestedDoctorName,
        workflowContext: args.workflowContext,
        candidateDoctors,
      }, args.doctorSelectionClient),
      candidateDoctors,
    );
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Doctor reassignment selection failed.';
    const actionTask = await persistReviewAction(args.client, args.workflow, args.message, args.action, reason);

    return {
      workflowId: args.workflow.id,
      actionTaskId: actionTask.id,
      resultTaskId: null,
      action: args.action.action,
      status: 'needs_review',
      message: reason,
    };
  }

  if (selection.needsReview || selection.selectedDoctorId === null) {
    const reason = selection.needsReviewReason ?? selection.reason;
    const actionTask = await persistReviewAction(args.client, args.workflow, args.message, args.action, reason);

    return {
      workflowId: args.workflow.id,
      actionTaskId: actionTask.id,
      resultTaskId: null,
      action: args.action.action,
      status: 'needs_review',
      message: reason,
    };
  }

  const assignedDoctor = candidateDoctors.find((doctor) => doctor.id === selection.selectedDoctorId);

  if (!assignedDoctor) {
    throw new Error(`Doctor reassignment selected non-candidate doctorId ${selection.selectedDoctorId}.`);
  }

  const previousAssignment = latestAssignment(args.workflow.tasks);
  const actionSequence = nextSequence(args.workflow.tasks);
  const resultSequence = actionSequence + 1;
  const result = await args.client.$transaction(async (tx) => {
    const actionTask = await tx.workflowTask.create({
      data: {
        workflowId: args.workflow.id,
        requestId: args.workflow.requests[0]?.id ?? null,
        taskType: 'workflow_action',
        sequence: actionSequence,
        status: 'completed',
        input: { message: args.message },
        output: args.action,
        reason: args.action.reason,
      },
    });
    const reassignmentTask = await tx.workflowTask.create({
      data: {
        workflowId: args.workflow.id,
        requestId: args.workflow.requests[0]?.id ?? null,
        taskType: 'doctor_reassignment',
        sequence: resultSequence,
        status: 'completed',
        input: {
          actionTaskId: actionTask.id,
          message: args.message,
          requestedDoctorName,
          previousAssignmentTaskId: previousAssignment.taskId,
          previousDoctorId: previousAssignment.doctorId,
          previousDoctorName: previousAssignment.doctorName,
          candidateDoctors,
        },
        output: {
          assignedDoctorId: assignedDoctor.id,
          assignedDoctorName: assignedDoctor.name,
          assignmentReason: selection.reason,
          confidence: selection.confidence,
        },
        reason: selection.reason,
      },
    });

    await tx.assignment.create({
      data: {
        doctorId: assignedDoctor.id,
        workflowTaskId: reassignmentTask.id,
        summary: buildReassignmentSummary(assignedDoctor.name, previousAssignment, selection.reason),
      },
    });
    await tx.workflow.update({ where: { id: args.workflow.id }, data: { status: 'assigned' } });

    return { actionTask, reassignmentTask };
  });

  return {
    workflowId: args.workflow.id,
    actionTaskId: result.actionTask.id,
    resultTaskId: result.reassignmentTask.id,
    action: args.action.action,
    status: 'completed',
    message: `Assigned to ${assignedDoctor.name}.`,
  };
}

async function persistReviewAction(
  client: WorkflowActionServiceClient,
  workflow: WorkflowRecord,
  message: string,
  action: WorkflowAction,
  reason: string,
): Promise<WorkflowTaskRecord> {
  return client.$transaction(async (tx) => tx.workflowTask.create({
    data: {
      workflowId: workflow.id,
      requestId: workflow.requests[0]?.id ?? null,
      taskType: 'workflow_action',
      sequence: nextSequence(workflow.tasks),
      status: 'needs_review',
      input: { message },
      output: { ...action, reason },
      reason,
    },
  }));
}

function toWorkflowActionContext(workflow: WorkflowRecord): WorkflowActionContext {
  return {
    workflowId: workflow.id,
    workflowStatus: workflow.status,
    originalRequest: workflow.requests[0]?.rawRequest ?? null,
    tasks: workflow.tasks.map((task) => ({
      taskType: task.taskType,
      status: task.status,
      reason: task.reason,
      output: task.output,
    })),
  };
}

function nextSequence(tasks: WorkflowTaskRecord[]): number {
  return Math.max(0, ...tasks.map((task) => task.sequence)) + 1;
}

function latestAssignment(tasks: WorkflowTaskRecord[]): PreviousAssignment {
  const assignmentTask = [...tasks]
    .filter((task) => task.taskType === 'doctor_assignment' || task.taskType === 'doctor_reassignment')
    .sort((left, right) => right.sequence - left.sequence)[0];

  if (!assignmentTask || !assignmentTask.output || typeof assignmentTask.output !== 'object') {
    return { taskId: null, doctorId: null, doctorName: null };
  }

  const output = assignmentTask.output as Record<string, unknown>;

  return {
    taskId: assignmentTask.id,
    doctorId: typeof output.assignedDoctorId === 'number' ? output.assignedDoctorId : null,
    doctorName: typeof output.assignedDoctorName === 'string' ? output.assignedDoctorName : null,
  };
}

function buildReassignmentSummary(doctorName: string, previousAssignment: PreviousAssignment, reason: string): string {
  const previousDoctor = previousAssignment.doctorName ? ` from ${previousAssignment.doctorName}` : '';

  return `Reassigned${previousDoctor} to ${doctorName}. ${reason}`;
}
