import { findCandidateDoctorsByName, type CandidateDoctorPayload } from '../team/candidates';
import {
  completeDoctorReassignmentWorkflow,
  createWorkflowActionTask,
  loadWorkflowForAction,
  type PreviousAssignment,
  type WorkflowActionServiceClient,
  type WorkflowRecord,
  type WorkflowTaskRecord,
} from '../database/workflow-action.queries';
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

export type { WorkflowActionServiceClient } from '../database/workflow-action.queries';

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

export async function processWorkflowAction(
  workflowId: number,
  message: string,
  options: ProcessWorkflowActionOptions = {},
): Promise<ProcessWorkflowActionResult> {
  const normalizedMessage = message.trim();

  if (!normalizedMessage) {
    throw new Error('message is required.');
  }

  const client = options.client;
  const workflow = await loadWorkflowForAction(workflowId, client);
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

async function persistUnsupportedAction(args: {
  client?: WorkflowActionServiceClient;
  workflow: WorkflowRecord;
  message: string;
  action: WorkflowAction;
}): Promise<ProcessWorkflowActionResult> {
  const actionTask = await createWorkflowActionTask({
    client: args.client,
    workflowId: args.workflow.id,
    requestId: args.workflow.requests[0]?.id ?? null,
    sequence: nextSequence(args.workflow.tasks),
    status: 'unsupported',
    message: args.message,
    output: args.action,
    reason: args.action.reason,
  });

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
  client?: WorkflowActionServiceClient;
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
  const result = await completeDoctorReassignmentWorkflow({
    client: args.client,
    workflowId: args.workflow.id,
    requestId: args.workflow.requests[0]?.id ?? null,
    actionSequence,
    resultSequence,
    message: args.message,
    action: args.action,
    requestedDoctorName,
    previousAssignment,
    candidateDoctors,
    assignedDoctor,
    selectionReason: selection.reason,
    selectionConfidence: selection.confidence,
    assignmentSummary: buildReassignmentSummary(assignedDoctor.name, previousAssignment, selection.reason),
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
  client: WorkflowActionServiceClient | undefined,
  workflow: WorkflowRecord,
  message: string,
  action: WorkflowAction,
  reason: string,
): Promise<WorkflowTaskRecord> {
  return createWorkflowActionTask({
    client,
    workflowId: workflow.id,
    requestId: workflow.requests[0]?.id ?? null,
    sequence: nextSequence(workflow.tasks),
    status: 'needs_review',
    message,
    output: { ...action, reason },
    reason,
  });
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
