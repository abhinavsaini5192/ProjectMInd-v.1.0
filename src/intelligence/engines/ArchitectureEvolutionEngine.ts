import { LLMAdapter } from '../adapters/LLMAdapter';
import { PromptManager } from '../prompts/PromptManager';
import { ArchitecturalEvent, ArchitecturalEventSchema } from '../models/SemanticModels';
import { Fact } from '../../extraction/models/Fact';
import { ProjectMindError } from '../../errors';

/**
 * Detects structural changes that impact the system architecture.
 */
export class ArchitectureEvolutionEngine {
  private llm: LLMAdapter;

  constructor(llm: LLMAdapter) {
    this.llm = llm;
  }

  /**
   * Evaluates facts against known architecture to detect regressions or evolutions.
   */
  public async detectArchitectureChanges(facts: Fact[], previousArchitectureState: string): Promise<ArchitecturalEvent | null> {
    if (facts.length === 0) return null;

    const factsJson = JSON.stringify(facts, null, 2);
    const systemPrompt = "You are the ProjectMind Architecture Evolution Engine. Detect Layer Violations or new Subsystems.";
    const userPrompt = PromptManager.getArchitecturalEvolutionPrompt(factsJson, previousArchitectureState);

    try {
      const response = await this.llm.generateStructured<ArchitecturalEvent>(systemPrompt, userPrompt, 'ArchitecturalEvent');
      
      const validated = ArchitecturalEventSchema.safeParse(response);
      if (!validated.success) {
        throw new ProjectMindError(`AI returned invalid architectural schema: ${validated.error.message}`, 'AI_SCHEMA_VIOLATION');
      }

      return validated.data;
    } catch (err: any) {
      throw new ProjectMindError(`Architecture detection failed: ${err.message}`, 'ARCHITECTURE_DETECTION_FAILED');
    }
  }
}
