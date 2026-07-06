import type { IncomingMessage, ServerResponse } from 'node:http';
import { getWorkflow, listWorkflows } from './workflow-list.service';

export async function getWorkflowsController(_request: IncomingMessage, response: ServerResponse): Promise<void> {
  try {
    const workflows = await listWorkflows();
    sendJson(response, 200, { workflows });
  } catch (error) {
    console.error('Failed to load workflows.', error);
    sendJson(response, 500, { error: 'Failed to load workflows.' });
  }
}

export async function getWorkflowController(_request: IncomingMessage, response: ServerResponse, workflowId: number): Promise<void> {
  try {
    const workflow = await getWorkflow(workflowId);

    if (!workflow) {
      sendJson(response, 404, { error: 'Workflow not found.' });
      return;
    }

    sendJson(response, 200, { workflow });
  } catch (error) {
    console.error('Failed to load workflow.', error);
    sendJson(response, 500, { error: 'Failed to load workflow.' });
  }
}

function sendJson(response: ServerResponse, statusCode: number, payload: unknown): void {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(payload));
}
