import {
  getWorkflowRecord,
  listWorkflowRecords,
  type WorkflowListQueryClient,
  type WorkflowListRecord,
  type WorkflowTaskRecord,
} from '../database/workflow-list.queries';

export type { WorkflowListQueryClient } from '../database/workflow-list.queries';

export type WorkflowSummary = {
  id: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  requestCount: number;
  taskCount: number;
  latestTaskStatus: string | null;
  latestTaskType: string | null;
  route: string | null;
  priority: string | null;
  caseSummary: string | null;
  reason: string | null;
};

export type WorkflowTaskSummary = {
  id: number;
  requestId: number | null;
  taskType: string;
  sequence: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  route: string | null;
  priority: string | null;
  caseSummary: string | null;
  reason: string | null;
  assignedDoctorId: number | null;
  assignedDoctorName: string | null;
  confidence: number | null;
};

export type WorkflowDetail = WorkflowSummary & {
  tasks: WorkflowTaskSummary[];
};

export type ListWorkflowsOptions = {
  client?: WorkflowListQueryClient;
};

export async function listWorkflows(options: ListWorkflowsOptions = {}): Promise<WorkflowSummary[]> {
  const workflows = await listWorkflowRecords(options.client);

  return workflows.map(toWorkflowSummary);
}

export async function getWorkflow(workflowId: number, options: ListWorkflowsOptions = {}): Promise<WorkflowDetail | null> {
  const workflow = await getWorkflowRecord(workflowId, options.client);

  return workflow ? { ...toWorkflowSummary(workflow), tasks: workflow.tasks.map(toWorkflowTaskSummary) } : null;
}

function toWorkflowSummary(workflow: WorkflowListRecord): WorkflowSummary {
  const latestTask = [...workflow.tasks].sort((left, right) => right.sequence - left.sequence || right.createdAt.getTime() - left.createdAt.getTime())[0];
  const routingOutput = latestTask ? toTaskRoutingOutput(latestTask) : emptyRoutingOutput();
  const reason = latestTask ? reasonForTask(latestTask) : routingOutput.reason;

  return {
    id: workflow.id,
    status: workflow.status,
    createdAt: workflow.createdAt.toISOString(),
    updatedAt: workflow.updatedAt.toISOString(),
    requestCount: workflow._count.requests,
    taskCount: workflow._count.tasks,
    latestTaskStatus: latestTask?.status ?? null,
    latestTaskType: latestTask?.taskType ?? null,
    route: routingOutput.route,
    priority: routingOutput.priority,
    caseSummary: routingOutput.caseSummary,
    reason,
  };
}

function toWorkflowTaskSummary(task: WorkflowTaskRecord): WorkflowTaskSummary {
  const routingOutput = toTaskRoutingOutput(task);
  const reason = reasonForTask(task);
  const assignmentOutput = toAssignmentOutput(task.output);

  return {
    id: task.id,
    requestId: task.requestId,
    taskType: task.taskType,
    sequence: task.sequence,
    status: task.status,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    route: routingOutput.route,
    priority: routingOutput.priority,
    caseSummary: routingOutput.caseSummary,
    reason,
    assignedDoctorId: assignmentOutput.assignedDoctorId,
    assignedDoctorName: assignmentOutput.assignedDoctorName,
    confidence: assignmentOutput.confidence,
  };
}

function toTaskRoutingOutput(task: WorkflowTaskRecord): Pick<WorkflowSummary, 'route' | 'priority' | 'caseSummary' | 'reason'> {
  const outputRouting = toRoutingOutput(task.output);

  if (outputRouting.route || outputRouting.priority || outputRouting.caseSummary || outputRouting.reason) {
    return outputRouting;
  }

  return toRoutingOutput(task.input);
}

function toRoutingOutput(output: unknown): Pick<WorkflowSummary, 'route' | 'priority' | 'caseSummary' | 'reason'> {
  if (!output || typeof output !== 'object') {
    return emptyRoutingOutput();
  }

  const record = output as Record<string, unknown>;
  const routingDecision = record.routingDecision && typeof record.routingDecision === 'object'
    ? record.routingDecision as Record<string, unknown>
    : null;

  return {
    route: typeof record.route === 'string' ? record.route : stringOrNull(routingDecision?.route),
    priority: typeof record.priority === 'string' ? record.priority : stringOrNull(routingDecision?.priority),
    caseSummary: typeof record.caseSummary === 'string' ? record.caseSummary : stringOrNull(routingDecision?.caseSummary),
    reason: typeof record.reason === 'string' ? record.reason : null,
  };
}

function emptyRoutingOutput(): Pick<WorkflowSummary, 'route' | 'priority' | 'caseSummary' | 'reason'> {
  return { route: null, priority: null, caseSummary: null, reason: null };
}

function toAssignmentOutput(output: unknown): Pick<WorkflowTaskSummary, 'assignedDoctorId' | 'assignedDoctorName' | 'confidence'> {
  if (!output || typeof output !== 'object') {
    return emptyAssignmentOutput();
  }

  const record = output as Record<string, unknown>;

  return {
    assignedDoctorId: typeof record.assignedDoctorId === 'number' ? record.assignedDoctorId : null,
    assignedDoctorName: typeof record.assignedDoctorName === 'string' ? record.assignedDoctorName : null,
    confidence: typeof record.confidence === 'number'
      ? record.confidence
      : typeof record.rankingConfidence === 'number'
        ? record.rankingConfidence
        : null,
  };
}

function emptyAssignmentOutput(): Pick<WorkflowTaskSummary, 'assignedDoctorId' | 'assignedDoctorName' | 'confidence'> {
  return { assignedDoctorId: null, assignedDoctorName: null, confidence: null };
}

function reasonForTask(task: WorkflowTaskRecord): string | null {
  if (task.reason) {
    return task.reason;
  }

  if (!task.output || typeof task.output !== 'object') {
    return null;
  }

  const output = task.output as Record<string, unknown>;

  if (task.taskType === 'skills_ranking') {
    return stringOrNull(output.reason);
  }

  if (task.taskType === 'doctor_ranking' || task.taskType === 'doctor_assignment') {
    return stringOrNull(output.assignmentReason) ?? stringOrNull(output.unassignableReason);
  }

  return stringOrNull(output.reason);
}

function stringOrNull(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}
