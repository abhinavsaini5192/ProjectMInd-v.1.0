import { LLMAdapter } from '../adapters/LLMAdapter';
import { PromptManager } from '../prompts/PromptManager';
import { KnowledgeGraph } from './KnowledgeGraphBuilder';
import { ProjectMindError } from '../../errors';

/**
 * Produces concise, human-and-AI-readable markdown summaries of the project state.
 */
export class SummaryGenerator {
  private llm: LLMAdapter;

  constructor(llm: LLMAdapter) {
    this.llm = llm;
  }

  /**
   * Generates a context summary for AI agents.
   */
  public async generateSummary(graph: KnowledgeGraph): Promise<string> {
    try {
      // Create a heavily truncated representation of the graph to save tokens
      const recentEvents = graph.semanticEvents.slice(-5).map(e => e.summary).join('\n');
      const systemPrompt = "You are the ProjectMind Summary Generator. Create concise context payloads.";
      const userPrompt = PromptManager.getSummaryPrompt(recentEvents);
      
      const markdownSummary = await this.llm.generateText(systemPrompt, userPrompt);
      return markdownSummary;
    } catch (err: any) {
      throw new ProjectMindError(`Summary generation failed: ${err.message}`, 'SUMMARY_GENERATION_FAILED');
    }
  }
}
