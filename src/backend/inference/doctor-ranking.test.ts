import { describe, expect, it, vi } from 'vitest';
import type { CandidateDoctorPayload } from '../team/candidates';
import type { RoutingDecision } from './routing';
import {
  createDoctorRanking,
  doctorRankingOutputSchema,
  doctorRankingSystemPrompt,
  parseDoctorRanking,
  validateDoctorRanking,
  type DoctorRankingClient,
} from './doctor-ranking';
import type { RankedSkill } from './skills-ranking';

const routingDecision: RoutingDecision = {
  route: 'doctor_assignment',
  confidence: 0.94,
  reason: 'Clinical review needed.',
  caseSummary: 'Renal biopsy review requested.',
  caseType: 'renal biopsy',
  priority: 'normal',
  requiredSpecialties: ['renal pathology'],
  requiredSkills: ['lupus nephritis'],
  patientContext: {},
};

const rankedSkills: RankedSkill[] = [
  { skillId: 1, skillCode: 'renal-pathology', score: 0.9, reason: 'Specialty match.' },
];

const candidateDoctors: CandidateDoctorPayload[] = [
  {
    id: 7,
    name: 'Dr. Emily Chen',
    specialties: ['Renal Pathology'],
    skills: ['Lupus Nephritis'],
    caseTypes: ['Renal Biopsy'],
    description: 'Renal pathologist.',
    ptoStatus: false,
    currentLoad: 3,
  },
];

describe('createDoctorRanking', () => {
  it('sends request context, ranked skills, and candidate doctors to the inference client', async () => {
    const rankDoctors = vi.fn<DoctorRankingClient['rankDoctors']>().mockResolvedValue({
      selectedDoctorId: 7,
      confidence: 0.91,
      assignmentReason: 'Best clinical fit.',
      rankedCandidates: [{ doctorId: 7, score: 0.96, reason: 'Renal match.' }],
      unassignable: false,
      unassignableReason: null,
    });

    const ranking = await createDoctorRanking(
      { rawRequest: '  Need renal review.  ', routingDecision, rankedSkills, candidateDoctors },
      { rankDoctors },
    );

    expect(rankDoctors).toHaveBeenCalledWith({
      rawRequest: 'Need renal review.',
      routingDecision,
      rankedSkills,
      candidateDoctors,
      systemPrompt: doctorRankingSystemPrompt,
      outputSchema: doctorRankingOutputSchema,
    });
    expect(ranking.selectedDoctorId).toBe(7);
  });

  it('rejects malformed output', () => {
    expect(() => parseDoctorRanking({ selectedDoctorId: null, confidence: 2 })).toThrow('confidence');
  });

  it('rejects non-candidate selections and low confidence assignments', () => {
    expect(() => validateDoctorRanking({
      selectedDoctorId: 99,
      confidence: 0.9,
      assignmentReason: 'bad',
      rankedCandidates: [],
      unassignable: false,
      unassignableReason: null,
    }, candidateDoctors)).toThrow('non-candidate');

    expect(() => validateDoctorRanking({
      selectedDoctorId: 7,
      confidence: 0.4,
      assignmentReason: 'too uncertain',
      rankedCandidates: [{ doctorId: 7, score: 0.8, reason: 'match' }],
      unassignable: false,
      unassignableReason: null,
    }, candidateDoctors)).toThrow('below');
  });
});
