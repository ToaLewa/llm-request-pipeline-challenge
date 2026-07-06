import type { IncomingMessage, ServerResponse } from 'node:http';
import { getDoctorPool } from './pool.service';

export async function getDoctorPoolController(_request: IncomingMessage, response: ServerResponse): Promise<void> {
  try {
    const doctors = await getDoctorPool();
    sendJson(response, 200, { doctors });
  } catch (error) {
    console.error('Failed to load doctor pool.', error);
    sendJson(response, 500, { error: 'Failed to load doctor pool.' });
  }
}

function sendJson(response: ServerResponse, statusCode: number, payload: unknown): void {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(payload));
}
