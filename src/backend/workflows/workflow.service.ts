import {
  createInitialWorkflowRecords,
  type InitialWorkflowClient,
  type InitialWorkflowResult,
} from '../database/initial-workflow.queries';
import type { RoutingDecision } from '../inference/routing';

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

  return createInitialWorkflowRecords({
    client: options.client,
    rawRequest: normalizedRequest,
    routingDecision,
    source,
  });
}
