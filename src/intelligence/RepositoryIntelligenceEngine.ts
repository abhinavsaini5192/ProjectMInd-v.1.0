import { Service } from '../interfaces';
import { LLMAdapter } from './adapters/LLMAdapter';
import { MockLLMAdapter } from './adapters/MockLLMAdapter';
import { ChangeClassifier } from './engines/ChangeClassifier';
import { ArchitectureEvolutionEngine } from './engines/ArchitectureEvolutionEngine';
import { KnowledgeGraphBuilder, KnowledgeGraph } from './engines/KnowledgeGraphBuilder';
import { SummaryGenerator } from './engines/SummaryGenerator';
import { Fact } from '../extraction/models/Fact';
import { ProjectMindError } from '../errors';

/**
 * The primary facade for the Phase 3 Intelligence Engine.
 * Wires as a Service into the Phase 1 Kernel.
 */
export class RepositoryIntelligenceEngine implements Service {
  public readonly name = 'intelligence-engine';
  
  public llm: LLMAdapter;
  public classifier: ChangeClassifier;
  public archEngine: ArchitectureEvolutionEngine;
  public graphBuilder: KnowledgeGraphBuilder;
  public summaryGenerator: SummaryGenerator;

  constructor(customAdapter?: LLMAdapter) {
    // Default to Mock for testing, but allow dependency injection for OpenAI/Local adapters.
    this.llm = customAdapter || new MockLLMAdapter();
    
    this.classifier = new ChangeClassifier(this.llm);
    this.archEngine = new ArchitectureEvolutionEngine(this.llm);
    this.graphBuilder = new KnowledgeGraphBuilder();
    this.summaryGenerator = new SummaryGenerator(this.llm);
  }

  public async initialize(): Promise<void> {
    // Engine specific init if required.
  }

  public async shutdown(): Promise<void> {
    // Cleanup if required.
  }

  /**
   * The core public API workflow for processing new facts.
   */
  public async analyzeChanges(facts: Fact[]): Promise<KnowledgeGraph> {
    try {
      // 1. Semantic Classification
      const semanticEvent = await this.classifier.classifyChanges(facts);
      
      // 2. Architectural Evolution Detection
      // Mock previous state for MVP
      const archEvent = await this.archEngine.detectArchitectureChanges(facts, "Initial State");
      
      // 3. Incrementally Update Knowledge Graph
      this.graphBuilder.updateKnowledgeGraph(facts, semanticEvent, archEvent || undefined);
      
      return this.graphBuilder.getGraph();
    } catch (err: any) {
      throw new ProjectMindError(`Intelligence Engine analysis failed: ${err.message}`, 'INTELLIGENCE_ANALYSIS_FAILED');
    }
  }

  /**
   * Generates a context payload for external AI agents.
   */
  public async getContextSummary(): Promise<string> {
    return this.summaryGenerator.generateSummary(this.graphBuilder.getGraph());
  }
}
