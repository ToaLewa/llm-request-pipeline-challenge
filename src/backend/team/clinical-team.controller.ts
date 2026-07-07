import type { Request, Response } from 'express';
import { parseIntegerParam } from '../utils/route-params';
import { getClinicalTeam, getTeamMemberCases } from './clinical-team.service';

export async function getClinicalTeamController(_request: Request, response: Response): Promise<void> {
  try {
    const teamMembers = await getClinicalTeam();
    response.status(200).json({ teamMembers });
  } catch (error) {
    console.error('Failed to load clinical team.', error);
    response.status(500).json({ error: 'Failed to load clinical team.' });
  }
}

export async function getTeamMemberCasesController(request: Request, response: Response): Promise<void> {
  try {
    const teamMemberId = parseIntegerParam(request.params.teamMemberId);

    if (Number.isNaN(teamMemberId)) {
      response.status(404).json({ error: 'Team member not found.' });
      return;
    }

    const teamMemberCases = await getTeamMemberCases(teamMemberId);

    if (!teamMemberCases) {
      response.status(404).json({ error: 'Team member not found.' });
      return;
    }

    response.status(200).json(teamMemberCases);
  } catch (error) {
    console.error('Failed to load team member cases.', error);
    response.status(500).json({ error: 'Failed to load team member cases.' });
  }
}
