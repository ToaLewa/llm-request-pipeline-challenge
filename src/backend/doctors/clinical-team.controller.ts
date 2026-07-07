import type { IncomingMessage, ServerResponse } from 'node:http';
import { getClinicalTeam } from './clinical-team.service';

export async function getClinicalTeamController(_request: IncomingMessage, response: ServerResponse): Promise<void> {
  try {
    const teamMembers = await getClinicalTeam();
    sendJson(response, 200, { teamMembers });
  } catch (error) {
    console.error('Failed to load clinical team.', error);
    sendJson(response, 500, { error: 'Failed to load clinical team.' });
  }
}

function sendJson(response: ServerResponse, statusCode: number, payload: unknown): void {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(payload));
}
