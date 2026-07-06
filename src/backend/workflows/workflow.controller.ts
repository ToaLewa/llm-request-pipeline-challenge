import type { IncomingMessage, ServerResponse } from 'node:http';
import { listWorkflows } from './workflow-list.service';

export async function getWorkflowsController(_request: IncomingMessage, response: ServerResponse): Promise<void> {
  try {
    const workflows = await listWorkflows();
    sendJson(response, 200, { workflows });
  } catch (error) {
    console.error('Failed to load workflows.', error);
    sendJson(response, 500, { error: 'Failed to load workflows.' });
  }
}

function sendJson(response: ServerResponse, statusCode: number, payload: unknown): void {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(payload));
}
