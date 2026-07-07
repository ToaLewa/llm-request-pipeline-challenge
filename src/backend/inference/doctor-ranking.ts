import { z } from 'zod';
import type { CandidateDoctorPayload } from '../team/candidates';
import { OpenAIJsonResponseClient, type OpenAIJsonResponseClientOptions } from './openai-client';
import type { RankedSkill } from './skills-ranking';
import type { RoutingDecision } from './routing';

const rankedCandidateSchema = z.object({
  doctorId: z.number().int().positive(),
  score: z.number().finite().min(0).max(1),
  reason: z.string(),
});

export const doctorRankingSchema = z.object({
  selectedDoctorId: z.number().int().positive().nullable(),
  confidence: z.number().finite().min(0).max(1),
  assignmentReason: z.string(),
  rankedCandidates: z.array(rankedCandidateSchema),
  unassignable: z.boolean(),
  unassignableReason: z.string().nullable(),
});

export type RankedCandidate = z.infer<typeof rankedCandidateSchema>;

export type DoctorRanking = z.infer<typeof doctorRankingSchema>;

export type DoctorRankingInput = {
  rawRequest: string;
  routingDecision: RoutingDecision;
  rankedSkills: RankedSkill[];
  candidateDoctors: CandidateDoctorPayload[];
};

export type DoctorRankingClientInput = DoctorRankingInput & {
  systemPrompt: string;
  outputSchema: Record<string, unknown>;
};

export type DoctorRankingClient = {
  rankDoctors(input: DoctorRankingClientInput): Promise<unknown>;
};

export type OpenAIDoctorRankingClientOptions = OpenAIJsonResponseClientOptions;

export const doctorAssignmentConfidenceThreshold = 0.7;

export const doctorRankingSystemPrompt = [
  'You rank candidate doctors for a clinical assignment.',
  'Rank only the provided candidate doctors.',
  'Never select or rank a doctor outside the candidate list.',
  'Prefer specialty and clinical fit over low workload.',
  'Use workload as a tie-breaker when expertise is similar.',
  'Return unassignable true when no candidate is clinically appropriate.',
  'Return only valid JSON matching the schema.',
].join('\n');

export const doctorRankingOutputSchema = {
  selectedDoctorId: 'number or null',
  confidence: 'number between 0 and 1',
  assignmentReason: 'string',
  rankedCandidates: [{ doctorId: 'number', score: 'number between 0 and 1', reason: 'string' }],
  unassignable: 'boolean',
  unassignableReason: 'string or null',
};

export class OpenAIDoctorRankingClient implements DoctorRankingClient {
  private readonly client: OpenAIJsonResponseClient;

  constructor(options: OpenAIDoctorRankingClientOptions = {}) {
    this.client = new OpenAIJsonResponseClient(options);
  }

  async rankDoctors(input: DoctorRankingClientInput): Promise<unknown> {
    return this.client.createJsonObjectResponse({
      instructions: input.systemPrompt,
      payload: {
        instruction: 'Return a JSON object matching the outputSchema.',
        rawRequest: input.rawRequest,
        routingDecision: input.routingDecision,
        rankedSkills: input.rankedSkills,
        candidateDoctors: input.candidateDoctors,
        outputSchema: input.outputSchema,
      },
    });
  }
}

export function createOpenAIDoctorRankingClient(options?: OpenAIDoctorRankingClientOptions): DoctorRankingClient {
  return new OpenAIDoctorRankingClient(options);
}

export async function createDoctorRanking(
  input: DoctorRankingInput,
  client: DoctorRankingClient,
): Promise<DoctorRanking> {
  const ranking = await client.rankDoctors({
    ...input,
    rawRequest: input.rawRequest.trim(),
    systemPrompt: doctorRankingSystemPrompt,
    outputSchema: doctorRankingOutputSchema,
  });

  return parseDoctorRanking(ranking);
}

export function parseDoctorRanking(value: unknown): DoctorRanking {
  return doctorRankingSchema.parse(value);
}

export function validateDoctorRanking(
  ranking: DoctorRanking,
  candidateDoctors: CandidateDoctorPayload[],
  confidenceThreshold = doctorAssignmentConfidenceThreshold,
): DoctorRanking {
  const candidateIds = new Set(candidateDoctors.map((doctor) => doctor.id));

  if (ranking.unassignable && ranking.selectedDoctorId !== null) {
    throw new Error('Doctor ranking selected a doctor while marked unassignable.');
  }

  if (!ranking.unassignable && ranking.selectedDoctorId === null) {
    throw new Error('Doctor ranking must select a doctor when assignable.');
  }

  if (ranking.selectedDoctorId !== null && !candidateIds.has(ranking.selectedDoctorId)) {
    throw new Error(`Doctor ranking selected non-candidate doctorId ${ranking.selectedDoctorId}.`);
  }

  if (!ranking.unassignable && ranking.confidence < confidenceThreshold) {
    throw new Error(`Doctor ranking confidence ${ranking.confidence} is below ${confidenceThreshold}.`);
  }

  const seenDoctorIds = new Set<number>();
  const dedupedRankedCandidates: RankedCandidate[] = [];

  for (const rankedCandidate of ranking.rankedCandidates) {
    if (!candidateIds.has(rankedCandidate.doctorId)) {
      throw new Error(`Doctor ranking referenced non-candidate doctorId ${rankedCandidate.doctorId}.`);
    }

    if (!seenDoctorIds.has(rankedCandidate.doctorId)) {
      seenDoctorIds.add(rankedCandidate.doctorId);
      dedupedRankedCandidates.push(rankedCandidate);
    }
  }

  return {
    ...ranking,
    rankedCandidates: dedupedRankedCandidates,
  };
}
