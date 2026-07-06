import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  createOpenAIRoutingDecisionClient,
  createRoutingDecision,
} from '../inference/routing';
import { createInitialWorkflow } from '../workflows/workflow.service';

type RequestPayload = {
  rawRequest?: unknown;
};

export async function createRequestController(request: IncomingMessage, response: ServerResponse): Promise<void> {
  try {
    const payload = await readJsonBody<RequestPayload>(request);
    const rawRequest = typeof payload.rawRequest === 'string' ? payload.rawRequest.trim() : '';

    if (!rawRequest) {
      sendJson(response, 400, { error: 'rawRequest is required.' });
      return;
    }

    const client = createOpenAIRoutingDecisionClient();
    const routingDecision = await createRoutingDecision(rawRequest, client);
    const workflow = await createInitialWorkflow(rawRequest, routingDecision, { source: 'web' });

    sendJson(response, 201, { ...workflow, routingDecision });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to route request.';
    console.error('Failed to create request.', error);
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
