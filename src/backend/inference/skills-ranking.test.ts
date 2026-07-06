import { describe, expect, it, vi } from 'vitest';
import type { RoutingDecision } from './routing';
import {
  createSkillsRanking,
  parseSkillsRanking,
  skillsRankingOutputSchema,
  skillsRankingSystemPrompt,
  validateSkillsRanking,
  type SkillsRankingClient,
} from './skills-ranking';
import type { AvailableSkill } from '../skills/skills.service';

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

const availableSkills: AvailableSkill[] = [
  { id: 1, name: 'Renal Pathology', skillCode: 'renal-pathology', category: 'specialty' },
  { id: 2, name: 'Lupus Nephritis', skillCode: 'lupus-nephritis', category: 'clinical_skill' },
];

describe('createSkillsRanking', () => {
  it('sends request context and canonical skills to the inference client', async () => {
    const rankSkills = vi.fn<SkillsRankingClient['rankSkills']>().mockResolvedValue({
      rankedSkills: [{ skillId: 2, skillCode: 'lupus-nephritis', score: 0.95, reason: 'Most specific match.' }],
      confidence: 0.9,
      reason: 'Canonical skill matched request.',
    });

    const ranking = await createSkillsRanking(
      { rawRequest: '  Need lupus nephritis review.  ', routingDecision, availableSkills },
      { rankSkills },
    );

    expect(rankSkills).toHaveBeenCalledWith({
      rawRequest: 'Need lupus nephritis review.',
      routingDecision,
      availableSkills,
      systemPrompt: skillsRankingSystemPrompt,
      outputSchema: skillsRankingOutputSchema,
    });
    expect(ranking.rankedSkills).toHaveLength(1);
  });

  it('rejects malformed output', () => {
    expect(() => parseSkillsRanking({ rankedSkills: [], confidence: 2, reason: 'bad' })).toThrow('confidence');
  });

  it('rejects invented skill IDs or mismatched skill codes', () => {
    expect(() => validateSkillsRanking({
      rankedSkills: [{ skillId: 99, skillCode: 'made-up', score: 0.8, reason: 'bad' }],
      confidence: 0.8,
      reason: 'bad',
    }, availableSkills)).toThrow('unknown skillId');

    expect(() => validateSkillsRanking({
      rankedSkills: [{ skillId: 1, skillCode: 'lupus-nephritis', score: 0.8, reason: 'bad' }],
      confidence: 0.8,
      reason: 'bad',
    }, availableSkills)).toThrow('does not match');
  });
});
