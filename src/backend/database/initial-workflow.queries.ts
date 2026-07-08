import { getPrisma } from './client';
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

type WorkflowTaskCreateData =
  | {
    workflowId: number;
    requestId: number;
    taskType: 'routing_decision';
    sequence: 1;
    status: 'completed';
    input: { rawRequest: string };
    output: RoutingDecision;
    reason: string;
  }
  | {
    workflowId: number;
    requestId: number;
    taskType: 'unknown_human_review';
    sequence: 2;
    status: 'required';
    input: {
      failedTaskId: number;
      failedTaskType: 'routing_decision';
      routingRoute: 'unknown_human_review';
    };
    output: {
      route: 'unknown_human_review';
      reason: string;
    };
    reason: string;
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
    create(args: { data: WorkflowTaskCreateData }): Promise<WorkflowTaskRecord>;
  };
};

export type InitialWorkflowClient = {
  $transaction<T>(handler: (tx: InitialWorkflowTransactionClient) => Promise<T>): Promise<T>;
};

export async function createInitialWorkflowRecords(args: {
  client?: InitialWorkflowClient;
  rawRequest: string;
  routingDecision: RoutingDecision;
  source: string;
}): Promise<InitialWorkflowResult> {
  const client = args.client ?? defaultInitialWorkflowClient();

  return client.$transaction(async (tx) => {
    const request = await tx.workflowRequest.create({
      data: {
        rawRequest: args.rawRequest,
        source: args.source,
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
        input: { rawRequest: args.rawRequest },
        output: args.routingDecision,
        reason: args.routingDecision.reason,
      },
    });

    if (args.routingDecision.route === 'unknown_human_review') {
      await tx.workflowTask.create({
        data: {
          workflowId: workflow.id,
          requestId: request.id,
          taskType: 'unknown_human_review',
          sequence: 2,
          status: 'required',
          input: {
            failedTaskId: task.id,
            failedTaskType: 'routing_decision',
            routingRoute: args.routingDecision.route,
          },
          output: {
            route: 'unknown_human_review',
            reason: args.routingDecision.reason,
          },
          reason: args.routingDecision.reason,
        },
      });
    }

    return {
      workflowId: workflow.id,
      requestId: request.id,
      taskId: task.id,
    };
  });
}

function defaultInitialWorkflowClient(): InitialWorkflowClient {
  return getPrisma() as unknown as InitialWorkflowClient;
}
