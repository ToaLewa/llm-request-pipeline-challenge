import OpenAI from 'openai';
import { z } from 'zod';

export const requestRoutes = [
  'doctor_assignment',
  'billing',
  'records_request',
  'scheduling',
  'unknown',
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

export type OpenAIRoutingDecisionClientOptions = {
  apiKey?: string;
  model?: string;
};

const defaultOpenAIModel = 'gpt-4.1-mini';

const routingDecisionJsonSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'route',
    'confidence',
    'reason',
    'caseSummary',
    'caseType',
    'priority',
    'requiredSpecialties',
    'requiredSkills',
    'patientContext',
  ],
  properties: {
    route: { type: 'string', enum: requestRoutes },
    confidence: { type: 'number', minimum: 0, maximum: 1 },
    reason: { type: 'string' },
    caseSummary: { type: 'string' },
    caseType: { type: ['string', 'null'] },
    priority: { type: 'string', enum: requestPriorities },
    requiredSpecialties: {
      type: 'array',
      items: { type: 'string' },
    },
    requiredSkills: {
      type: 'array',
      items: { type: 'string' },
    },
    patientContext: {
      type: 'object',
      additionalProperties: {
        type: ['string', 'number', 'boolean', 'null'],
      },
    },
  },
} as const;

let envLoaded = false;

function loadEnvFile(): void {
  if (envLoaded) {
    return;
  }

  envLoaded = true;
  process.loadEnvFile?.();
}

export class OpenAIRoutingDecisionClient implements RoutingDecisionClient {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(options: OpenAIRoutingDecisionClientOptions = {}) {
    loadEnvFile();

    const apiKey = options.apiKey ?? process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is required in the environment or .env file.');
    }

    this.client = new OpenAI({ apiKey });
    this.model = options.model ?? process.env.OPENAI_MODEL ?? defaultOpenAIModel;
  }

  async decideRoute(input: RoutingDecisionInput): Promise<unknown> {
    const response = await this.client.responses.create({
      model: this.model,
      instructions: input.systemPrompt,
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: JSON.stringify({
                rawRequest: input.rawRequest,
                outputSchema: input.outputSchema,
              }),
            },
          ],
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'routing_decision',
          strict: true,
          schema: routingDecisionJsonSchema,
        },
      },
    });

    return JSON.parse(response.output_text);
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
