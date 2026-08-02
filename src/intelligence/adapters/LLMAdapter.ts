/**
 * Generic abstraction for all AI model inference.
 */
export interface LLMAdapter {
  /**
   * Generates a structured JSON response based on a prompt.
   * @param systemPrompt The system instructions.
   * @param userPrompt The facts and context.
   * @param schema Optional Zod schema or JSON schema definition to enforce.
   */
  generateStructured<T>(systemPrompt: string, userPrompt: string, schemaName?: string): Promise<T>;
  
  /**
   * Generates a plain text response (e.g., for summaries).
   */
  generateText(systemPrompt: string, userPrompt: string): Promise<string>;
}
