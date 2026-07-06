import { getPrisma } from '../database/client';

type WorkflowTaskRecord = {
  id: number;
  taskType: string;
  status: string;
  output: unknown;
  reason: string | null;
  createdAt: Date;
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

function toWorkflowSummary(workflow: WorkflowListRecord): WorkflowSummary {
  const latestTask = workflow.tasks[0];
  const routingOutput = toRoutingOutput(latestTask?.output);

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
    reason: latestTask?.reason ?? routingOutput.reason,
  };
}

function toRoutingOutput(output: unknown): Pick<WorkflowSummary, 'route' | 'priority' | 'caseSummary' | 'reason'> {
  if (!output || typeof output !== 'object') {
    return { route: null, priority: null, caseSummary: null, reason: null };
  }

  const record = output as Record<string, unknown>;

  return {
    route: typeof record.route === 'string' ? record.route : null,
    priority: typeof record.priority === 'string' ? record.priority : null,
    caseSummary: typeof record.caseSummary === 'string' ? record.caseSummary : null,
    reason: typeof record.reason === 'string' ? record.reason : null,
  };
}
