import { describe, it, expect } from 'vitest';
import { RepositoryIntelligenceEngine } from '../src/intelligence/RepositoryIntelligenceEngine';
import { MockLLMAdapter } from '../src/intelligence/adapters/MockLLMAdapter';
import { ConfidenceLevel } from '../src/intelligence/models/SemanticModels';
import { Fact } from '../src/extraction/models/Fact';

describe('RepositoryIntelligenceEngine', () => {
  it('should process facts and update the knowledge graph successfully', async () => {
    const mockAdapter = new MockLLMAdapter();
    
    // Inject mock responses for our classifiers
    mockAdapter.setMockResponse('Change Classifier', {
      type: 'FeatureAdded',
      summary: 'Added Authentication',
      confidence: ConfidenceLevel.HIGH,
      reasoning: 'Mocked reasoning.'
    });

    mockAdapter.setMockResponse('Architecture Evolution Engine', {
      type: 'NewSubsystem',
      description: 'Auth Subsystem added.',
      confidence: ConfidenceLevel.MEDIUM,
      affectedComponents: ['src/auth.ts'],
      reasoning: 'Mocked reasoning.'
    });

    const engine = new RepositoryIntelligenceEngine(mockAdapter);

    const mockFacts: Fact[] = [{
      id: 'function:src/auth.ts#login',
      type: 'FunctionAdded',
      language: 'typescript',
      sourceFile: 'src/auth.ts',
      timestamp: Date.now(),
      version: 'abc1234',
      confidence: 1.0
    }];

    const graph = await engine.analyzeChanges(mockFacts);

    // Verify Graph Updates
    expect(graph.facts.has('function:src/auth.ts#login')).toBe(true);
    
    // Verify Semantic Event was appended
    expect(graph.semanticEvents.length).toBe(1);
    expect(graph.semanticEvents[0].type).toBe('FeatureAdded');
    expect(graph.semanticEvents[0].summary).toBe('Added Authentication');

    // Verify Architectural Event was appended
    expect(graph.architecturalEvents.length).toBe(1);
    expect(graph.architecturalEvents[0].type).toBe('NewSubsystem');
  });
});
