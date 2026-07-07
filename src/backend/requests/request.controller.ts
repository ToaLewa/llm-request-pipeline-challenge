import type { Request, Response } from 'express';
import {
  createOpenAIRoutingDecisionClient,
  createRoutingDecision,
} from '../inference/routing';
import { processDoctorAssignmentWorkflow } from '../workflows/doctor-assignment.service';
import { createInitialWorkflow } from '../workflows/workflow.service';

type RequestPayload = {
  rawRequest?: unknown;
};

export async function createRequestController(request: Request, response: Response): Promise<void> {
  try {
    const payload = (request.body ?? {}) as RequestPayload;
    const rawRequest = typeof payload.rawRequest === 'string' ? payload.rawRequest.trim() : '';

    if (!rawRequest) {
      response.status(400).json({ error: 'rawRequest is required.' });
      return;
    }

    const client = createOpenAIRoutingDecisionClient();
    const routingDecision = await createRoutingDecision(rawRequest, client);
    const workflow = await createInitialWorkflow(rawRequest, routingDecision, { source: 'web' });

    if (routingDecision.route === 'doctor_assignment') {
      await processDoctorAssignmentWorkflow(workflow.workflowId);
    }

    response.status(201).json({ ...workflow, routingDecision });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to route request.';
    console.error('Failed to create request.', error);
    response.status(500).json({ error: message });
  }
}
