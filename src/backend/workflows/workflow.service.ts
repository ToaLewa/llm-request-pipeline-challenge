import {
  createInitialWorkflowRecords,
  type InitialWorkflowClient,
  type InitialWorkflowResult,
} from '../database/initial-workflow.queries';
import type { RoutingDecision } from '../inference/routing';
import { createHumanReviewTask } from './human-review.service';

export type { InitialWorkflowClient, InitialWorkflowResult } from '../database/initial-workflow.queries';

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

  const source = options.source ?? 'user';

  const workflow = await createInitialWorkflowRecords({
    client: options.client,
    rawRequest: normalizedRequest,
    routingDecision,
    source,
  });

  if (routingDecision.route === 'unknown_human_review') {
    await createHumanReviewTask({
      client: options.client,
      workflowId: workflow.workflowId,
      requestId: workflow.requestId,
      sequence: 2,
      failedTask: {
        id: workflow.taskId,
        taskType: 'routing_decision',
        status: 'completed',
      },
      failureContext: { routingRoute: routingDecision.route },
      reason: routingDecision.reason,
    });
  }

  return workflow;
}
