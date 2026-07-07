import OpenAI from 'openai';
import { loadEnvFile } from '../utils/env';

export type OpenAIJsonResponseClientOptions = {
  apiKey?: string;
  model?: string;
};

export type CreateJsonObjectResponseInput = {
  instructions: string;
  payload: Record<string, unknown>;
};

const defaultOpenAIModel = 'gpt-4.1-mini';

export class OpenAIJsonResponseClient {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(options: OpenAIJsonResponseClientOptions = {}) {
    loadEnvFile();

    const apiKey = options.apiKey ?? process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is required in the environment or .env file.');
    }

    this.client = new OpenAI({ apiKey });
    this.model = options.model ?? process.env.OPENAI_MODEL ?? defaultOpenAIModel;
  }

  async createJsonObjectResponse(input: CreateJsonObjectResponseInput): Promise<unknown> {
    const response = await this.client.responses.create({
      model: this.model,
      instructions: input.instructions,
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: JSON.stringify(input.payload),
            },
          ],
        },
      ],
      text: { format: { type: 'json_object' } },
    });

    return JSON.parse(response.output_text);
  }
}
