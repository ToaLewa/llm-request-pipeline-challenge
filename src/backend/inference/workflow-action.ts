import OpenAI from 'openai';
import { z } from 'zod';
import type { CandidateDoctorPayload } from '../team/candidates';
import { loadEnvFile } from '../utils/env';

export const workflowActionTypes = [
  'reassign_doctor',
  'close_assignment',
  'send_to_human_review',
  'reassign_non_doctor',
  'unknown',
] as const;

export const workflowActionSchema = z.object({
  action: z.enum(workflowActionTypes),
  requestedAssigneeName: z.string().min(1).nullable(),
  reason: z.string(),
  confidence: z.number().finite().min(0).max(1),
});

export const doctorReassignmentSelectionSchema = z.object({
  selectedDoctorId: z.number().int().positive().nullable(),
  confidence: z.number().finite().min(0).max(1),
  reason: z.string(),
  needsReview: z.boolean(),
  needsReviewReason: z.string().nullable(),
});

export type WorkflowAction = z.infer<typeof workflowActionSchema>;

export type DoctorReassignmentSelection = z.infer<typeof doctorReassignmentSelectionSchema>;

export type WorkflowActionInput = {
  message: string;
  workflowContext: WorkflowActionContext;
};

export type DoctorReassignmentSelectionInput = {
  message: string;
  requestedDoctorName: string;
  workflowContext: WorkflowActionContext;
  candidateDoctors: CandidateDoctorPayload[];
};

export type WorkflowActionContext = {
  workflowId: number;
  workflowStatus: string;
  originalRequest: string | null;
  tasks: Array<{
    taskType: string;
    status: string;
    reason: string | null;
    output: unknown;
  }>;
};

export type WorkflowActionClientInput = WorkflowActionInput & {
  systemPrompt: string;
  outputSchema: Record<string, unknown>;
};

export type DoctorReassignmentSelectionClientInput = DoctorReassignmentSelectionInput & {
  systemPrompt: string;
  outputSchema: Record<string, unknown>;
};

export type WorkflowActionClient = {
  classifyAction(input: WorkflowActionClientInput): Promise<unknown>;
};

export type DoctorReassignmentSelectionClient = {
  selectDoctor(input: DoctorReassignmentSelectionClientInput): Promise<unknown>;
};

export type OpenAIWorkflowActionClientOptions = {
  apiKey?: string;
  model?: string;
};

const defaultOpenAIModel = 'gpt-4.1-mini';

export const workflowActionSystemPrompt = [
  'You classify free-text workflow instructions into one workflow action.',
  'Use reassign_doctor only when the user asks to assign or reassign to a doctor or physician.',
  'Use close_assignment when the user asks to close, complete, cancel, or end the assignment.',
  'Use send_to_human_review when the user asks for manual review, human review, or escalation.',
  'Use reassign_non_doctor when the user asks to assign to a non-doctor person, queue, team, or role.',
  'Use unknown when the requested action is unclear.',
  'Extract the requested assignee name when present.',
  'Return only valid JSON matching the schema.',
].join('\n');

export const doctorReassignmentSelectionSystemPrompt = [
  'You choose the intended doctor for a workflow reassignment.',
  'Select only one doctor from the provided candidateDoctors list.',
  'Never select a doctor outside the candidateDoctors list.',
  'Use the requested doctor name as the strongest signal.',
  'Use workflow context only to resolve ambiguity, not to invent doctors.',
  'Return needsReview true when the requested doctor is missing or ambiguous.',
  'Return only valid JSON matching the schema.',
].join('\n');

export const workflowActionOutputSchema = {
  action: workflowActionTypes,
  requestedAssigneeName: 'string or null',
  reason: 'string',
  confidence: 'number between 0 and 1',
};

export const doctorReassignmentSelectionOutputSchema = {
  selectedDoctorId: 'number or null',
  confidence: 'number between 0 and 1',
  reason: 'string',
  needsReview: 'boolean',
  needsReviewReason: 'string or null',
};

export class OpenAIWorkflowActionClient implements WorkflowActionClient, DoctorReassignmentSelectionClient {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(options: OpenAIWorkflowActionClientOptions = {}) {
    loadEnvFile();

    const apiKey = options.apiKey ?? process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is required in the environment or .env file.');
    }

    this.client = new OpenAI({ apiKey });
    this.model = options.model ?? process.env.OPENAI_MODEL ?? defaultOpenAIModel;
  }

  async classifyAction(input: WorkflowActionClientInput): Promise<unknown> {
    const response = await this.client.responses.create({
      model: this.model,
      instructions: input.systemPrompt,
      input: [{
        role: 'user',
        content: [{
          type: 'input_text',
          text: JSON.stringify({
            instruction: 'Return a JSON object matching the outputSchema.',
            message: input.message,
            workflowContext: input.workflowContext,
            outputSchema: input.outputSchema,
          }),
        }],
      }],
      text: { format: { type: 'json_object' } },
    });

    return JSON.parse(response.output_text);
  }

  async selectDoctor(input: DoctorReassignmentSelectionClientInput): Promise<unknown> {
    const response = await this.client.responses.create({
      model: this.model,
      instructions: input.systemPrompt,
      input: [{
        role: 'user',
        content: [{
          type: 'input_text',
          text: JSON.stringify({
            instruction: 'Return a JSON object matching the outputSchema.',
            message: input.message,
            requestedDoctorName: input.requestedDoctorName,
            workflowContext: input.workflowContext,
            candidateDoctors: input.candidateDoctors,
            outputSchema: input.outputSchema,
          }),
        }],
      }],
      text: { format: { type: 'json_object' } },
    });

    return JSON.parse(response.output_text);
  }
}

export function createOpenAIWorkflowActionClient(options?: OpenAIWorkflowActionClientOptions): OpenAIWorkflowActionClient {
  return new OpenAIWorkflowActionClient(options);
}

export async function createWorkflowAction(
  input: WorkflowActionInput,
  client: WorkflowActionClient,
): Promise<WorkflowAction> {
  const message = input.message.trim();

  if (!message) {
    throw new Error('A message is required to create a workflow action.');
  }

  return parseWorkflowAction(await client.classifyAction({
    ...input,
    message,
    systemPrompt: workflowActionSystemPrompt,
    outputSchema: workflowActionOutputSchema,
  }));
}

export async function createDoctorReassignmentSelection(
  input: DoctorReassignmentSelectionInput,
  client: DoctorReassignmentSelectionClient,
): Promise<DoctorReassignmentSelection> {
  return parseDoctorReassignmentSelection(await client.selectDoctor({
    ...input,
    message: input.message.trim(),
    requestedDoctorName: input.requestedDoctorName.trim(),
    systemPrompt: doctorReassignmentSelectionSystemPrompt,
    outputSchema: doctorReassignmentSelectionOutputSchema,
  }));
}

export function parseWorkflowAction(value: unknown): WorkflowAction {
  return workflowActionSchema.parse(value);
}

export function parseDoctorReassignmentSelection(value: unknown): DoctorReassignmentSelection {
  return doctorReassignmentSelectionSchema.parse(value);
}

export function validateDoctorReassignmentSelection(
  selection: DoctorReassignmentSelection,
  candidateDoctors: CandidateDoctorPayload[],
  confidenceThreshold = 0.7,
): DoctorReassignmentSelection {
  const candidateIds = new Set(candidateDoctors.map((doctor) => doctor.id));

  if (selection.needsReview && selection.selectedDoctorId !== null) {
    throw new Error('Doctor reassignment selected a doctor while marked needsReview.');
  }

  if (!selection.needsReview && selection.selectedDoctorId === null) {
    throw new Error('Doctor reassignment must select a doctor when review is not needed.');
  }

  if (selection.selectedDoctorId !== null && !candidateIds.has(selection.selectedDoctorId)) {
    throw new Error(`Doctor reassignment selected non-candidate doctorId ${selection.selectedDoctorId}.`);
  }

  if (!selection.needsReview && selection.confidence < confidenceThreshold) {
    throw new Error(`Doctor reassignment confidence ${selection.confidence} is below ${confidenceThreshold}.`);
  }

  return selection;
}
