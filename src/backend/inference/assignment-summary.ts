import OpenAI from 'openai';
import { z } from 'zod';
import { loadEnvFile } from '../utils/env';

const assignmentSummarySchema = z.object({
  summary: z.string().min(1),
});

export type AssignmentSummary = z.infer<typeof assignmentSummarySchema>;

export type AssignmentSummaryInput = {
  rawRequest: string;
  workflowContext: Array<{
    taskType: string;
    status: string;
    reason: string | null;
    output: unknown;
  }>;
  assignedDoctor: {
    id: number;
    name: string | null;
  };
};

export type AssignmentSummaryClientInput = AssignmentSummaryInput & {
  systemPrompt: string;
  outputSchema: Record<string, unknown>;
};

export type AssignmentSummaryClient = {
  summarizeAssignment(input: AssignmentSummaryClientInput): Promise<unknown>;
};

export type OpenAIAssignmentSummaryClientOptions = {
  apiKey?: string;
  model?: string;
};

const defaultOpenAIModel = 'gpt-4.1-mini';

export const assignmentSummarySystemPrompt = [
  'You summarize a clinical assignment for the assigned doctor.',
  'Use only the provided request and workflow context.',
  'Focus on what the doctor needs to do and why the case was routed to them.',
  'Do not invent patient facts, diagnoses, or missing details.',
  'Return only valid JSON matching the schema.',
].join('\n');

export const assignmentSummaryOutputSchema = {
  summary: 'string describing what is required of the assigned doctor',
};

export class OpenAIAssignmentSummaryClient implements AssignmentSummaryClient {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(options: OpenAIAssignmentSummaryClientOptions = {}) {
    loadEnvFile();

    const apiKey = options.apiKey ?? process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is required in the environment or .env file.');
    }

    this.client = new OpenAI({ apiKey });
    this.model = options.model ?? process.env.OPENAI_MODEL ?? defaultOpenAIModel;
  }

  async summarizeAssignment(input: AssignmentSummaryClientInput): Promise<unknown> {
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
                instruction: 'Return a JSON object matching the outputSchema.',
                rawRequest: input.rawRequest,
                workflowContext: input.workflowContext,
                assignedDoctor: input.assignedDoctor,
                outputSchema: input.outputSchema,
              }),
            },
          ],
        },
      ],
      text: { format: { type: 'json_object' } },
    });

    return JSON.parse(response.output_text);
  }
}

export function createOpenAIAssignmentSummaryClient(options?: OpenAIAssignmentSummaryClientOptions): AssignmentSummaryClient {
  return new OpenAIAssignmentSummaryClient(options);
}

export async function createAssignmentSummary(
  input: AssignmentSummaryInput,
  client: AssignmentSummaryClient,
): Promise<AssignmentSummary> {
  const summary = await client.summarizeAssignment({
    ...input,
    rawRequest: input.rawRequest.trim(),
    systemPrompt: assignmentSummarySystemPrompt,
    outputSchema: assignmentSummaryOutputSchema,
  });

  return assignmentSummarySchema.parse(summary);
}
