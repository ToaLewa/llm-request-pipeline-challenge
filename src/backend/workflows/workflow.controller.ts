import type { Request, Response } from 'express';
import { parseIntegerParam } from '../utils/route-params';
import { processWorkflowAction } from './workflow-action.service';
import { getWorkflow, listWorkflows } from './workflow-list.service';

type WorkflowActionPayload = {
  message?: unknown;
};

export async function getWorkflowsController(_request: Request, response: Response): Promise<void> {
  try {
    const workflows = await listWorkflows();
    response.status(200).json({ workflows });
  } catch (error) {
    console.error('Failed to load workflows.', error);
    response.status(500).json({ error: 'Failed to load workflows.' });
  }
}

export async function getWorkflowController(request: Request, response: Response): Promise<void> {
  try {
    const workflowId = parseIntegerParam(request.params.workflowId);

    if (Number.isNaN(workflowId)) {
      response.status(404).json({ error: 'Workflow not found.' });
      return;
    }

    const workflow = await getWorkflow(workflowId);

    if (!workflow) {
      response.status(404).json({ error: 'Workflow not found.' });
      return;
    }

    response.status(200).json({ workflow });
  } catch (error) {
    console.error('Failed to load workflow.', error);
    response.status(500).json({ error: 'Failed to load workflow.' });
  }
}

export async function createWorkflowActionController(request: Request, response: Response): Promise<void> {
  try {
    const workflowId = parseIntegerParam(request.params.workflowId);

    if (Number.isNaN(workflowId)) {
      response.status(404).json({ error: 'Workflow not found.' });
      return;
    }

    const payload = (request.body ?? {}) as WorkflowActionPayload;
    const message = typeof payload.message === 'string' ? payload.message.trim() : '';

    if (!message) {
      response.status(400).json({ error: 'message is required.' });
      return;
    }

    const result = await processWorkflowAction(workflowId, message);
    response.status(201).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to process workflow action.';

    if (message.includes('was not found')) {
      response.status(404).json({ error: message });
      return;
    }

    console.error('Failed to process workflow action.', error);
    response.status(500).json({ error: message });
  }
}
