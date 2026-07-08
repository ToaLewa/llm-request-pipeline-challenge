import { describe, expect, it, vi } from 'vitest';
import { getClinicalTeam, getTeamMemberCases, type ClinicalTeamQueryClient } from './clinical-team.service';

describe('getClinicalTeam', () => {
  it('loads team members with normalized skill rows and groups display values by category', async () => {
    const findMany = vi.fn<ClinicalTeamQueryClient['teamMember']['findMany']>().mockResolvedValue([
      {
        id: 1,
        name: 'Dr. Emily Chen',
        jobTitle: 'Renal Pathologist',
        description: 'Renal pathologist focused on autoimmune kidney disease.',
        ptoStatus: false,
        active: true,
        _count: { assignments: 4 },
        skills: [
          { skill: { name: 'Renal Pathology', category: 'specialty' } },
          { skill: { name: 'Renal Biopsy', category: 'case_type' } },
          { skill: { name: 'Lupus Nephritis', category: 'clinical_skill' } },
        ],
      },
    ]);

    const findUnique = vi.fn<ClinicalTeamQueryClient['teamMember']['findUnique']>();
    const teamMembers = await getClinicalTeam({ client: { teamMember: { findMany, findUnique } } });

    expect(findMany).toHaveBeenCalledWith({
      include: {
        _count: {
          select: {
            assignments: true,
          },
        },
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
        jobTitle: 'Renal Pathologist',
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

describe('getTeamMemberCases', () => {
  it('loads assigned cases with workflow task context', async () => {
    const assignedAt = new Date('2026-01-02T03:04:05.000Z');
    const updatedAt = new Date('2026-01-03T03:04:05.000Z');
    const findMany = vi.fn<ClinicalTeamQueryClient['teamMember']['findMany']>();
    const findUnique = vi.fn<ClinicalTeamQueryClient['teamMember']['findUnique']>().mockResolvedValue({
      id: 1,
      name: 'Dr. Emily Chen',
      assignments: [
        {
          id: 12,
          summary: 'Review renal biopsy case.',
          createdAt: assignedAt,
          updatedAt,
          workflowTask: {
            id: 99,
            workflowId: 7,
            requestId: 3,
            taskType: 'doctor_assignment',
            status: 'completed',
            input: null,
            output: {
              routingDecision: {
                priority: 'high',
                caseSummary: 'Renal biopsy review requested.',
                caseType: 'renal biopsy',
              },
            },
            reason: 'Assigned to renal specialist.',
            createdAt: assignedAt,
            updatedAt,
          },
        },
      ],
    });

    const teamMemberCases = await getTeamMemberCases(1, { client: { teamMember: { findMany, findUnique } } });

    expect(findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      select: {
        id: true,
        name: true,
        assignments: {
          include: {
            workflowTask: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    expect(teamMemberCases).toEqual({
      teamMember: { id: 1, name: 'Dr. Emily Chen' },
      cases: [
        {
          id: 12,
          assignmentSummary: 'Review renal biopsy case.',
          workflowId: 7,
          workflowTaskId: 99,
          requestId: 3,
          taskType: 'doctor_assignment',
          status: 'completed',
          priority: 'high',
          caseSummary: 'Renal biopsy review requested.',
          caseType: 'renal biopsy',
          reason: 'Assigned to renal specialist.',
          assignedAt: assignedAt.toISOString(),
          updatedAt: updatedAt.toISOString(),
        },
      ],
    });
  });
});
