import { z } from 'zod';
import type { RoutingDecision } from './routing';
import type { AvailableSkill } from '../skills/skills.service';
import { OpenAIJsonResponseClient, type OpenAIJsonResponseClientOptions } from './openai-client';

const rankedSkillSchema = z.object({
  skillId: z.number().int().positive(),
  skillCode: z.string(),
  score: z.number().finite().min(0).max(1),
  reason: z.string(),
});

export const skillsRankingSchema = z.object({
  rankedSkills: z.array(rankedSkillSchema),
  confidence: z.number().finite().min(0).max(1),
  reason: z.string(),
});

export type RankedSkill = z.infer<typeof rankedSkillSchema>;

export type SkillsRanking = z.infer<typeof skillsRankingSchema>;

export type SkillsRankingInput = {
  rawRequest: string;
  routingDecision: RoutingDecision;
  availableSkills: AvailableSkill[];
};

export type SkillsRankingClientInput = SkillsRankingInput & {
  systemPrompt: string;
  outputSchema: Record<string, unknown>;
};

export type SkillsRankingClient = {
  rankSkills(input: SkillsRankingClientInput): Promise<unknown>;
};

export type OpenAISkillsRankingClientOptions = OpenAIJsonResponseClientOptions;

export const skillsRankingSystemPrompt = [
  'You rank canonical database skills for clinical doctor assignment.',
  'Rank only skills from the provided availableSkills list.',
  'Never invent skill IDs, skill codes, specialties, case types, or clinical skills.',
  'Prefer clinically specific matches over broad matches.',
  'Include a mix of relevant specialty, case type, and clinical skill records when applicable.',
  'Return an empty ranked list if no canonical skill is relevant.',
  'Return only valid JSON matching the schema.',
].join('\n');

export const skillsRankingOutputSchema = {
  rankedSkills: [{ skillId: 'number', skillCode: 'string', score: 'number between 0 and 1', reason: 'string' }],
  confidence: 'number between 0 and 1',
  reason: 'string',
};

export class OpenAISkillsRankingClient implements SkillsRankingClient {
  private readonly client: OpenAIJsonResponseClient;

  constructor(options: OpenAISkillsRankingClientOptions = {}) {
    this.client = new OpenAIJsonResponseClient(options);
  }

  async rankSkills(input: SkillsRankingClientInput): Promise<unknown> {
    return this.client.createJsonObjectResponse({
      instructions: input.systemPrompt,
      payload: {
        instruction: 'Return a JSON object matching the outputSchema.',
        rawRequest: input.rawRequest,
        routingDecision: input.routingDecision,
        availableSkills: input.availableSkills,
        outputSchema: input.outputSchema,
      },
    });
  }
}

export function createOpenAISkillsRankingClient(options?: OpenAISkillsRankingClientOptions): SkillsRankingClient {
  return new OpenAISkillsRankingClient(options);
}

export async function createSkillsRanking(
  input: SkillsRankingInput,
  client: SkillsRankingClient,
): Promise<SkillsRanking> {
  const ranking = await client.rankSkills({
    ...input,
    rawRequest: input.rawRequest.trim(),
    systemPrompt: skillsRankingSystemPrompt,
    outputSchema: skillsRankingOutputSchema,
  });

  return parseSkillsRanking(ranking);
}

export function parseSkillsRanking(value: unknown): SkillsRanking {
  return skillsRankingSchema.parse(value);
}

export function validateSkillsRanking(ranking: SkillsRanking, availableSkills: AvailableSkill[]): SkillsRanking {
  const availableById = new Map(availableSkills.map((skill) => [skill.id, skill]));
  const seenSkillIds = new Set<number>();
  const dedupedRankedSkills: RankedSkill[] = [];

  for (const rankedSkill of ranking.rankedSkills) {
    const availableSkill = availableById.get(rankedSkill.skillId);

    if (!availableSkill) {
      throw new Error(`Skill ranking referenced unknown skillId ${rankedSkill.skillId}.`);
    }

    if (availableSkill.skillCode !== rankedSkill.skillCode) {
      throw new Error(`Skill ranking skillCode does not match skillId ${rankedSkill.skillId}.`);
    }

    if (!seenSkillIds.has(rankedSkill.skillId)) {
      seenSkillIds.add(rankedSkill.skillId);
      dedupedRankedSkills.push(rankedSkill);
    }
  }

  return {
    ...ranking,
    rankedSkills: dedupedRankedSkills,
  };
}
