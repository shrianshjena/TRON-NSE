import { z } from 'zod';

/**
 * Extract JSON from a Perplexity response that may contain markdown fences
 * or surrounding prose.
 */
function extractJson(rawText: string): string {
  // Try to find JSON within code fences first
  const codeFenceMatch = rawText.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (codeFenceMatch) {
    return codeFenceMatch[1].trim();
  }

  // Try to find a JSON object or array directly
  const jsonObjectMatch = rawText.match(/(\{[\s\S]*\})/);
  if (jsonObjectMatch) {
    return jsonObjectMatch[1].trim();
  }

  const jsonArrayMatch = rawText.match(/(\[[\s\S]*\])/);
  if (jsonArrayMatch) {
    return jsonArrayMatch[1].trim();
  }

  // Return the raw text as-is and let JSON.parse handle the error
  return rawText.trim();
}

/**
 * Parse a Perplexity API response text, extract JSON, and validate against a Zod schema.
 *
 * @param rawText - Raw text response from Perplexity API
 * @param schema - Zod schema to validate the parsed JSON against
 * @returns Typed and validated data
 * @throws Error if JSON extraction, parsing, or validation fails
 */
export function parsePerplexityResponse<T>(
  rawText: string,
  schema: z.ZodType<T>
): T {
  const jsonString = extractJson(rawText);

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch (parseError) {
    throw new Error(
      `Failed to parse JSON from Perplexity response: ${
        parseError instanceof Error ? parseError.message : 'Unknown error'
      }\n\nRaw text (first 500 chars): ${rawText.slice(0, 500)}`
    );
  }

  const result = schema.safeParse(parsed);

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(
      `Perplexity response validation failed:\n${issues}\n\nParsed data keys: ${
        typeof parsed === 'object' && parsed !== null
          ? Object.keys(parsed).join(', ')
          : typeof parsed
      }`
    );
  }

  return result.data;
}
