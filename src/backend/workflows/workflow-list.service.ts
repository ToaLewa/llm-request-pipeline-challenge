import { getPrisma } from '../database/client';

type WorkflowTaskRecord = {
  id: number;
  requestId: number | null;
  taskType: string;
  sequence: number;
  status: string;
  input?: unknown;
  output: unknown;
  reason: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type WorkflowListRecord = {
  id: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    requests: number;
    tasks: number;
  };
  tasks: WorkflowTaskRecord[];
};

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
};

export type WorkflowDetail = WorkflowSummary & {
  tasks: WorkflowTaskSummary[];
};

export type WorkflowListQueryClient = {
  workflow: {
    findMany(args: {
      include: {
        _count: {
          select: {
            requests: true;
            tasks: true;
          };
        };
        tasks: {
          orderBy: [{ sequence: 'desc' }, { createdAt: 'desc' }];
          take: 1;
        };
      };
      orderBy: { createdAt: 'desc' };
    }): Promise<WorkflowListRecord[]>;
    findUnique(args: {
      where: { id: number };
      include: {
        _count: {
          select: {
            requests: true;
            tasks: true;
          };
        };
        tasks: {
          orderBy: [{ sequence: 'asc' }, { createdAt: 'asc' }];
        };
      };
    }): Promise<WorkflowListRecord | null>;
  };
};

export type ListWorkflowsOptions = {
  client?: WorkflowListQueryClient;
};

export async function listWorkflows(options: ListWorkflowsOptions = {}): Promise<WorkflowSummary[]> {
  const client: WorkflowListQueryClient = options.client ?? getPrisma();
  const workflows = await client.workflow.findMany({
    include: {
      _count: {
        select: {
          requests: true,
          tasks: true,
        },
      },
      tasks: {
        orderBy: [{ sequence: 'desc' }, { createdAt: 'desc' }],
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return workflows.map(toWorkflowSummary);
}

export async function getWorkflow(workflowId: number, options: ListWorkflowsOptions = {}): Promise<WorkflowDetail | null> {
  const client: WorkflowListQueryClient = options.client ?? getPrisma();
  const workflow = await client.workflow.findUnique({
    where: { id: workflowId },
    include: {
      _count: {
        select: {
          requests: true,
          tasks: true,
        },
      },
      tasks: {
        orderBy: [{ sequence: 'asc' }, { createdAt: 'asc' }],
      },
    },
  });

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
