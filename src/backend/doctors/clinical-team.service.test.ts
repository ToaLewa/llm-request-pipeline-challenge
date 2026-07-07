import { describe, expect, it, vi } from 'vitest';
import { getClinicalTeam, type ClinicalTeamQueryClient } from './clinical-team.service';

describe('getClinicalTeam', () => {
  it('loads team members with normalized skill rows and groups display values by category', async () => {
    const findMany = vi.fn<ClinicalTeamQueryClient['teamMember']['findMany']>().mockResolvedValue([
      {
        id: 1,
        name: 'Dr. Emily Chen',
        description: 'Renal pathologist focused on autoimmune kidney disease.',
        ptoStatus: false,
        currentLoad: 4,
        active: true,
        skills: [
          { skill: { name: 'Renal Pathology', category: 'specialty' } },
          { skill: { name: 'Renal Biopsy', category: 'case_type' } },
          { skill: { name: 'Lupus Nephritis', category: 'clinical_skill' } },
        ],
      },
    ]);

    const teamMembers = await getClinicalTeam({ client: { teamMember: { findMany } } });

    expect(findMany).toHaveBeenCalledWith({
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
      },
      orderBy: [{ active: 'desc' }, { ptoStatus: 'asc' }, { name: 'asc' }],
    });
    expect(teamMembers).toEqual([
      {
        id: 1,
        name: 'Dr. Emily Chen',
        specialties: ['Renal Pathology'],
        skills: ['Lupus Nephritis'],
        caseTypes: ['Renal Biopsy'],
        description: 'Renal pathologist focused on autoimmune kidney disease.',
        ptoStatus: false,
        currentLoad: 4,
        active: true,
      },
    ]);
  });
});
