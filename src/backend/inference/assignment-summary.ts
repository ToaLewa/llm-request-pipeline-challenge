import { z } from 'zod';
import { OpenAIJsonResponseClient, type OpenAIJsonResponseClientOptions } from './openai-client';

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

export type OpenAIAssignmentSummaryClientOptions = OpenAIJsonResponseClientOptions;

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
  private readonly client: OpenAIJsonResponseClient;

  constructor(options: OpenAIAssignmentSummaryClientOptions = {}) {
    this.client = new OpenAIJsonResponseClient(options);
  }

  async summarizeAssignment(input: AssignmentSummaryClientInput): Promise<unknown> {
    return this.client.createJsonObjectResponse({
      instructions: input.systemPrompt,
      payload: {
        instruction: 'Return a JSON object matching the outputSchema.',
        rawRequest: input.rawRequest,
        workflowContext: input.workflowContext,
        assignedDoctor: input.assignedDoctor,
        outputSchema: input.outputSchema,
      },
    });
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
