import type { IncomingMessage, ServerResponse } from 'node:http';
import { getClinicalTeam, getTeamMemberCases } from './clinical-team.service';

export async function getClinicalTeamController(_request: IncomingMessage, response: ServerResponse): Promise<void> {
  try {
    const teamMembers = await getClinicalTeam();
    sendJson(response, 200, { teamMembers });
  } catch (error) {
    console.error('Failed to load clinical team.', error);
    sendJson(response, 500, { error: 'Failed to load clinical team.' });
  }
}

export async function getTeamMemberCasesController(_request: IncomingMessage, response: ServerResponse, teamMemberId: number): Promise<void> {
  try {
    const teamMemberCases = await getTeamMemberCases(teamMemberId);

    if (!teamMemberCases) {
      sendJson(response, 404, { error: 'Team member not found.' });
      return;
    }

    sendJson(response, 200, teamMemberCases);
  } catch (error) {
    console.error('Failed to load team member cases.', error);
    sendJson(response, 500, { error: 'Failed to load team member cases.' });
  }
}

function sendJson(response: ServerResponse, statusCode: number, payload: unknown): void {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(payload));
}
