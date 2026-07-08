import { z } from 'zod';
import { OpenAIJsonResponseClient, type OpenAIJsonResponseClientOptions } from './openai-client';

export const requestRoutes = [
  'doctor_assignment',
  'billing',
  'records_request',
  'scheduling',
  'unknown_human_review',
] as const;

export const requestPriorities = ['low', 'normal', 'urgent'] as const;

const patientContextValueSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);

export const routingDecisionSchema = z.object({
  route: z.enum(requestRoutes),
  confidence: z.number().finite().min(0).max(1),
  reason: z.string(),
  caseSummary: z.string(),
  caseType: z.string().nullable(),
  priority: z.enum(requestPriorities),
  requiredSpecialties: z.array(z.string()),
  requiredSkills: z.array(z.string()),
  patientContext: z.record(z.string(), patientContextValueSchema),
});

export type RequestRoute = z.infer<typeof routingDecisionSchema>['route'];

export type RequestPriority = z.infer<typeof routingDecisionSchema>['priority'];

export type PatientContext = z.infer<typeof routingDecisionSchema>['patientContext'];

export type RoutingDecision = z.infer<typeof routingDecisionSchema>;

export type RoutingDecisionInput = {
  rawRequest: string;
  systemPrompt: string;
  outputSchema: Record<string, unknown>;
};

export type RoutingDecisionClient = {
  decideRoute(input: RoutingDecisionInput): Promise<unknown>;
};

export type OpenAIRoutingDecisionClientOptions = OpenAIJsonResponseClientOptions;

export class OpenAIRoutingDecisionClient implements RoutingDecisionClient {
  private readonly client: OpenAIJsonResponseClient;

  constructor(options: OpenAIRoutingDecisionClientOptions = {}) {
    this.client = new OpenAIJsonResponseClient(options);
  }

  async decideRoute(input: RoutingDecisionInput): Promise<unknown> {
    return this.client.createJsonObjectResponse({
      instructions: input.systemPrompt,
      payload: {
        instruction: [
          'Return a JSON object matching the outputSchema.',
          `route must be exactly one of: ${requestRoutes.join(', ')}.`,
          `priority must be exactly one of: ${requestPriorities.join(', ')}.`,
          'Use route unknown_human_review when the request cannot be classified.',
          'Use priority normal unless the request clearly indicates low or urgent priority.',
        ].join(' '),
        rawRequest: input.rawRequest,
        outputSchema: input.outputSchema,
      },
    });
  }
}

export function createOpenAIRoutingDecisionClient(
  options?: OpenAIRoutingDecisionClientOptions,
): RoutingDecisionClient {
  return new OpenAIRoutingDecisionClient(options);
}

export const routingSystemPrompt = [
  'You are routing incoming operational requests.',
  'Classify the request into one route.',
  'If it describes a clinical case, lab order, biopsy, diagnosis, patient condition, or specialist review need, route to doctor_assignment.',
  'Return only valid JSON matching the schema.',
  'Do not invent facts that are not present.',
  'Use unknown_human_review for nonsensical, ambiguous, or unclassifiable requests.',
  'Use null or empty arrays when unknown.',
].join('\n');

export const routingOutputSchema = {
  route: requestRoutes,
  confidence: 'number between 0 and 1',
  reason: 'string',
  caseSummary: 'string',
  caseType: 'string or null',
  priority: requestPriorities,
  requiredSpecialties: 'string[]',
  requiredSkills: 'string[]',
  patientContext: 'object with primitive values',
};

export async function createRoutingDecision(
  rawRequest: string,
  client: RoutingDecisionClient,
): Promise<RoutingDecision> {
  const normalizedRequest = rawRequest.trim();

  if (!normalizedRequest) {
    throw new Error('A raw request is required to create a routing decision.');
  }

  const decision = await client.decideRoute({
    rawRequest: normalizedRequest,
    systemPrompt: routingSystemPrompt,
    outputSchema: routingOutputSchema,
  });

  return parseRoutingDecision(decision);
}

export function parseRoutingDecision(value: unknown): RoutingDecision {
  return routingDecisionSchema.parse(value);
}
