import { getEnv } from '@/lib/utils/env';

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';
const REQUEST_TIMEOUT_MS = 30_000;

export interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface PerplexityResponse {
  id: string;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Query the Perplexity API with the given prompt.
 * Returns the raw text content from the first choice.
 *
 * @param prompt - The user prompt to send
 * @param systemPrompt - Optional system prompt for context
 * @returns Raw text response from Perplexity
 * @throws Error on network/API failures or timeout
 */
export async function queryPerplexity(
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  const env = getEnv();

  const messages: PerplexityMessage[] = [];

  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }

  messages.push({ role: 'user', content: prompt });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify({
        model: env.PERPLEXITY_MODEL,
        messages,
        temperature: 0.1,
        max_tokens: 4096,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'Unknown error');
      throw new Error(
        `Perplexity API error (${response.status}): ${errorBody}`
      );
    }

    const data = (await response.json()) as PerplexityResponse;

    if (!data.choices || data.choices.length === 0) {
      throw new Error('Perplexity API returned no choices');
    }

    const content = data.choices[0].message.content;

    if (!content || content.trim().length === 0) {
      throw new Error('Perplexity API returned empty content');
    }

    return content;
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error(
        `Perplexity API request timed out after ${REQUEST_TIMEOUT_MS / 1000}s`
      );
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
