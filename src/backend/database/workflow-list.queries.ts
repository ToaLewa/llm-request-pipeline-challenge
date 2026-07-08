import { getPrisma } from './client';

export type WorkflowTaskRecord = {
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

export type WorkflowListRecord = {
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

export async function listWorkflowRecords(client: WorkflowListQueryClient = getPrisma()): Promise<WorkflowListRecord[]> {
  return client.workflow.findMany({
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
}

export async function getWorkflowRecord(
  workflowId: number,
  client: WorkflowListQueryClient = getPrisma(),
): Promise<WorkflowListRecord | null> {
  return client.workflow.findUnique({
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
}
