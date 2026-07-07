import type { IncomingMessage, ServerResponse } from 'node:http';
import { processWorkflowAction } from './workflow-action.service';
import { getWorkflow, listWorkflows } from './workflow-list.service';

type WorkflowActionPayload = {
  message?: unknown;
};

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

export async function createWorkflowActionController(request: IncomingMessage, response: ServerResponse, workflowId: number): Promise<void> {
  try {
    const payload = await readJsonBody<WorkflowActionPayload>(request);
    const message = typeof payload.message === 'string' ? payload.message.trim() : '';

    if (!message) {
      sendJson(response, 400, { error: 'message is required.' });
      return;
    }

    const result = await processWorkflowAction(workflowId, message);
    sendJson(response, 201, result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to process workflow action.';

    if (message.includes('was not found')) {
      sendJson(response, 404, { error: message });
      return;
    }

    console.error('Failed to process workflow action.', error);
    sendJson(response, 500, { error: message });
  }
}

function readJsonBody<T>(request: IncomingMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    let body = '';

    request.setEncoding('utf8');
    request.on('data', (chunk) => {
      body += chunk;
    });
    request.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}') as T);
      } catch (error) {
        reject(error);
      }
    });
    request.on('error', reject);
  });
}

function sendJson(response: ServerResponse, statusCode: number, payload: unknown): void {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(payload));
}
