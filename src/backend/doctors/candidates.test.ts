import { describe, expect, it, vi } from 'vitest';
import type { RoutingDecision } from '../inference/routing';
import {
  findCandidateDoctors,
  findCandidateDoctorsByName,
  findCandidateDoctorsBySkillCodes,
  normalizeSkillCode,
  skillCodesFromRoutingDecision,
  type CandidateDoctorByNameQueryClient,
  type CandidateDoctorQueryClient,
} from './candidates';

const routingDecision: RoutingDecision = {
  route: 'doctor_assignment',
  confidence: 0.94,
  reason: 'The request describes a clinical case requiring specialist review.',
  caseSummary: 'Possible lupus nephritis with renal biopsy review needed.',
  caseType: 'Renal Biopsy',
  priority: 'normal',
  requiredSpecialties: ['Renal Pathology', 'Nephropathology'],
  requiredSkills: ['Lupus Nephritis', 'renal biopsy'],
  patientContext: {},
};

describe('normalizeSkillCode', () => {
  it('normalizes LLM strings into stable skill codes', () => {
    expect(normalizeSkillCode('  Lupus nephritis / renal biopsy  ')).toBe('lupus-nephritis-renal-biopsy');
  });
});

describe('skillCodesFromRoutingDecision', () => {
  it('combines specialties, skills, and case type while removing duplicates', () => {
    expect(skillCodesFromRoutingDecision(routingDecision)).toEqual([
      'renal-pathology',
      'nephropathology',
      'lupus-nephritis',
      'renal-biopsy',
    ]);
  });
});

describe('findCandidateDoctors', () => {
  it('queries active available doctors through normalized doctor-skill rows', async () => {
    const findMany = vi.fn<CandidateDoctorQueryClient['teamMember']['findMany']>().mockResolvedValue([
      {
        id: 1,
        name: 'Dr. Emily Chen',
        description: 'Renal pathologist focused on autoimmune kidney disease.',
        ptoStatus: false,
        currentLoad: 4,
        active: true,
        skills: [
          { skill: { name: 'Renal Pathology', skillCode: 'renal-pathology', category: 'specialty' } },
          { skill: { name: 'Renal Biopsy', skillCode: 'renal-biopsy', category: 'case_type' } },
          { skill: { name: 'Lupus Nephritis', skillCode: 'lupus-nephritis', category: 'clinical_skill' } },
        ],
      },
    ]);

    const candidates = await findCandidateDoctors(routingDecision, {
      client: { teamMember: { findMany } },
    });

    expect(findMany).toHaveBeenCalledWith({
      where: {
        active: true,
        ptoStatus: false,
        skills: {
          some: {
            skill: {
              skillCode: {
                in: ['renal-pathology', 'nephropathology', 'lupus-nephritis', 'renal-biopsy'],
              },
            },
          },
        },
      },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
      },
      orderBy: [{ currentLoad: 'asc' }],
    });
    expect(candidates).toEqual([
      {
        id: 1,
        name: 'Dr. Emily Chen',
        specialties: ['Renal Pathology'],
        skills: ['Lupus Nephritis'],
        caseTypes: ['Renal Biopsy'],
        description: 'Renal pathologist focused on autoimmune kidney disease.',
        ptoStatus: false,
        currentLoad: 4,
      },
    ]);
  });

  it('sorts by skill overlap before using current load as a tie-breaker', async () => {
    const findMany = vi.fn<CandidateDoctorQueryClient['teamMember']['findMany']>().mockResolvedValue([
      {
        id: 2,
        name: 'Dr. Ravi Patel',
        description: 'General surgical pathology.',
        ptoStatus: false,
        currentLoad: 1,
        active: true,
        skills: [{ skill: { name: 'Renal Biopsy', skillCode: 'renal-biopsy', category: 'case_type' } }],
      },
      {
        id: 1,
        name: 'Dr. Emily Chen',
        description: 'Renal pathology.',
        ptoStatus: false,
        currentLoad: 4,
        active: true,
        skills: [
          { skill: { name: 'Renal Pathology', skillCode: 'renal-pathology', category: 'specialty' } },
          { skill: { name: 'Renal Biopsy', skillCode: 'renal-biopsy', category: 'case_type' } },
          { skill: { name: 'Lupus Nephritis', skillCode: 'lupus-nephritis', category: 'clinical_skill' } },
        ],
      },
    ]);

    const candidates = await findCandidateDoctors(routingDecision, {
      client: { teamMember: { findMany } },
    });

    expect(candidates.map((candidate) => candidate.id)).toEqual([1, 2]);
  });

  it('does not query doctors when routing produced no searchable skills', async () => {
    const findMany = vi.fn<CandidateDoctorQueryClient['teamMember']['findMany']>();

    const candidates = await findCandidateDoctors(
      {
        ...routingDecision,
        caseType: null,
        requiredSpecialties: [],
        requiredSkills: [],
      },
      { client: { teamMember: { findMany } } },
    );

    expect(candidates).toEqual([]);
    expect(findMany).not.toHaveBeenCalled();
  });
});

describe('findCandidateDoctorsBySkillCodes', () => {
  it('searches doctors by explicit ranked skill codes', async () => {
    const findMany = vi.fn<CandidateDoctorQueryClient['teamMember']['findMany']>().mockResolvedValue([
      {
        id: 1,
        name: 'Dr. Emily Chen',
        description: 'Renal pathology.',
        ptoStatus: false,
        currentLoad: 4,
        active: true,
        skills: [{ skill: { name: 'Renal Pathology', skillCode: 'renal-pathology', category: 'specialty' } }],
      },
    ]);

    const candidates = await findCandidateDoctorsBySkillCodes(['renal-pathology', 'renal-pathology'], {
      client: { teamMember: { findMany } },
    });

    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        active: true,
        ptoStatus: false,
        skills: { some: { skill: { skillCode: { in: ['renal-pathology'] } } } },
      }),
    }));
    expect(candidates.map((candidate) => candidate.id)).toEqual([1]);
  });

  it('returns an empty list when no ranked skill codes are provided', async () => {
    const findMany = vi.fn<CandidateDoctorQueryClient['teamMember']['findMany']>();

    await expect(findCandidateDoctorsBySkillCodes([' ', ''], { client: { teamMember: { findMany } } })).resolves.toEqual([]);
    expect(findMany).not.toHaveBeenCalled();
  });
});

describe('findCandidateDoctorsByName', () => {
  it('searches active available doctors by case-insensitive name', async () => {
    const findMany = vi.fn<CandidateDoctorByNameQueryClient['teamMember']['findMany']>().mockResolvedValue([
      {
        id: 1,
        name: 'Dr. Emily Chen',
        description: 'Renal pathology.',
        ptoStatus: false,
        currentLoad: 4,
        active: true,
        skills: [{ skill: { name: 'Renal Pathology', skillCode: 'renal-pathology', category: 'specialty' } }],
      },
    ]);

    const candidates = await findCandidateDoctorsByName('Emily Chen', {
      client: { teamMember: { findMany } },
    });

    expect(findMany).toHaveBeenCalledWith({
      where: {
        active: true,
        ptoStatus: false,
        name: {
          contains: 'Emily Chen',
          mode: 'insensitive',
        },
      },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
      },
      orderBy: [{ currentLoad: 'asc' }],
      take: 8,
    });
    expect(candidates.map((candidate) => candidate.name)).toEqual(['Dr. Emily Chen']);
  });

  it('does not query doctors without a name', async () => {
    const findMany = vi.fn<CandidateDoctorByNameQueryClient['teamMember']['findMany']>();

    await expect(findCandidateDoctorsByName(' ', { client: { teamMember: { findMany } } })).resolves.toEqual([]);
    expect(findMany).not.toHaveBeenCalled();
  });
});
