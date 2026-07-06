import { getPrisma } from '../database/client';
import type { RoutingDecision } from '../inference/routing';

export type InitialWorkflowResult = {
  workflowId: number;
  requestId: number;
  taskId: number;
};

type WorkflowRecord = {
  id: number;
};

type WorkflowRequestRecord = {
  id: number;
};

type WorkflowTaskRecord = {
  id: number;
};

type InitialWorkflowTransactionClient = {
  workflowRequest: {
    create(args: { data: { rawRequest: string; source: string } }): Promise<WorkflowRequestRecord>;
    update(args: { where: { id: number }; data: { workflowId: number } }): Promise<WorkflowRequestRecord>;
  };
  workflow: {
    create(args: { data: Record<string, never> }): Promise<WorkflowRecord>;
  };
  workflowTask: {
    create(args: {
      data: {
        workflowId: number;
        requestId: number;
        taskType: 'routing_decision';
        sequence: 1;
        status: 'completed';
        input: { rawRequest: string };
        output: RoutingDecision;
        reason: string;
      };
    }): Promise<WorkflowTaskRecord>;
  };
};

export type InitialWorkflowClient = {
  $transaction<T>(handler: (tx: InitialWorkflowTransactionClient) => Promise<T>): Promise<T>;
};

export type CreateInitialWorkflowOptions = {
  client?: InitialWorkflowClient;
  source?: string;
};

export async function createInitialWorkflow(
  rawRequest: string,
  routingDecision: RoutingDecision,
  options: CreateInitialWorkflowOptions = {},
): Promise<InitialWorkflowResult> {
  const normalizedRequest = rawRequest.trim();

  if (!normalizedRequest) {
    throw new Error('A raw request is required to create an initial workflow.');
  }

  const client: InitialWorkflowClient = options.client ?? getPrisma();
  const source = options.source ?? 'user';

  return client.$transaction(async (tx) => {
    const request = await tx.workflowRequest.create({
      data: {
        rawRequest: normalizedRequest,
        source,
      },
    });
    const workflow = await tx.workflow.create({ data: {} });
    await tx.workflowRequest.update({
      where: { id: request.id },
      data: { workflowId: workflow.id },
    });
    const task = await tx.workflowTask.create({
      data: {
        workflowId: workflow.id,
        requestId: request.id,
        taskType: 'routing_decision',
        sequence: 1,
        status: 'completed',
        input: { rawRequest: normalizedRequest },
        output: routingDecision,
        reason: routingDecision.reason,
      },
    });

    return {
      workflowId: workflow.id,
      requestId: request.id,
      taskId: task.id,
    };
  });
}
