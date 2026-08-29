import { InvalidReasoningOutputError } from '../errors/InvalidReasoningOutputError';

export class JsonReasoningParser {
  /**
   * Resiliently extracts a JSON object from raw string or markdown code fence
   */
  public extractJson(raw: string): any {
    if (!raw || typeof raw !== 'string') {
      throw new InvalidReasoningOutputError('Empty or non-string SLM output received');
    }

    const trimmed = raw.trim();

    // 1. Attempt direct parse
    try {
      return JSON.parse(trimmed);
    } catch {
      // Continue to extraction heuristics
    }

    // 2. Markdown code block extraction (```json ... ``` or ``` ...)
    const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch && codeBlockMatch[1]) {
      try {
        return JSON.parse(codeBlockMatch[1].trim());
      } catch (err: any) {
        throw new InvalidReasoningOutputError(`Failed to parse JSON from markdown code block: ${err.message}`, raw);
      }
    }

    // 3. Find first outer JSON curly braces { ... }
    const firstBrace = trimmed.indexOf('{');
    const lastBrace = trimmed.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const candidate = trimmed.substring(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(candidate);
      } catch (err: any) {
        throw new InvalidReasoningOutputError(`Failed to parse outer JSON substring: ${err.message}`, raw);
      }
    }

    throw new InvalidReasoningOutputError('No valid JSON structure found in SLM response', raw);
  }
}
