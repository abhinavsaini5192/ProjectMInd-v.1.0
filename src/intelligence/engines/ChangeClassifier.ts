import { LLMAdapter } from '../adapters/LLMAdapter';
import { PromptManager } from '../prompts/PromptManager';
import { SemanticEvent, SemanticEventSchema } from '../models/SemanticModels';
import { Fact } from '../../extraction/models/Fact';
import { ProjectMindError } from '../../errors';

/**
 * Classifies structural changes into high-level semantic events.
 */
export class ChangeClassifier {
  private llm: LLMAdapter;

  constructor(llm: LLMAdapter) {
    this.llm = llm;
  }

  /**
   * Converts an array of structural facts into a semantic classification event.
   */
  public async classifyChanges(facts: Fact[]): Promise<SemanticEvent> {
    if (facts.length === 0) {
      throw new ProjectMindError('Cannot classify empty facts.', 'CLASSIFY_EMPTY_FACTS');
    }

    const factsJson = JSON.stringify(facts, null, 2);
    const systemPrompt = "You are the ProjectMind Change Classifier. Your job is to classify raw structural facts into semantic meaning.";
    const userPrompt = PromptManager.getChangeClassificationPrompt(factsJson);

    try {
      const response = await this.llm.generateStructured<SemanticEvent>(systemPrompt, userPrompt, 'SemanticEvent');
      
      // Strict validation of the AI output
      const validated = SemanticEventSchema.safeParse(response);
      if (!validated.success) {
        throw new ProjectMindError(`AI returned invalid semantic schema: ${validated.error.message}`, 'AI_SCHEMA_VIOLATION');
      }

      return validated.data;
    } catch (err: any) {
      throw new ProjectMindError(`Classification failed: ${err.message}`, 'CLASSIFICATION_FAILED');
    }
  }
}
