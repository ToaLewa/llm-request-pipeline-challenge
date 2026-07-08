import { getPrisma } from './client';

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

type WorkflowTaskTransactionClient = {
  workflowTask: {
    create(args: { data: WorkflowTaskCreateData }): Promise<WorkflowTaskRecord>;
  };
};

export type WorkflowTaskClient = {
  $transaction<T>(handler: (tx: WorkflowTaskTransactionClient) => Promise<T>): Promise<T>;
};

export async function createWorkflowTask(args: {
  client?: WorkflowTaskClient;
  data: WorkflowTaskCreateData;
}): Promise<WorkflowTaskRecord> {
  const client = args.client ?? defaultWorkflowTaskClient();

  return client.$transaction(async (tx) => tx.workflowTask.create({ data: args.data }));
}

function defaultWorkflowTaskClient(): WorkflowTaskClient {
  return getPrisma() as unknown as WorkflowTaskClient;
}
