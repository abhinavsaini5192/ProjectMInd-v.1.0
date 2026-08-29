import { describe, it, expect, beforeEach } from 'vitest';
import { ContextIntelligenceEngine } from '../../../src/brain/context/core/ContextIntelligenceEngine';
import { ContextGraphBuilder } from '../../../src/brain/context/planners/ContextGraphBuilder';
import { TaskPolicyEngine } from '../../../src/brain/context/policies/TaskPolicyEngine';
import { ContextFreshnessAnalyzer } from '../../../src/brain/context/analyzers/ContextFreshnessAnalyzer';
import { ContextDiversityManager } from '../../../src/brain/context/planners/ContextDiversityManager';
import { ContextCompressor } from '../../../src/brain/context/planners/ContextCompressor';
import { ContradictionDetector } from '../../../src/brain/context/analyzers/ContradictionDetector';
import { ContextPackBuilder } from '../../../src/brain/context/planners/ContextPackBuilder';
import { ContextCache } from '../../../src/brain/context/cache/ContextCache';
import { TokenCostEstimator } from '../../../src/brain/context/analyzers/TokenCostEstimator';
import { KernelEventDispatcher } from '../../../src/kernel/core/KernelEventDispatcher';
import { Decision } from '../../../src/brain/decision/models/Decision';
import { IntentType } from '../../../src/brain/decision/models/Intent';
import { ContextMode } from '../../../src/brain/context/models/ContextPack';

describe('Context Intelligence Engine (L3.2)', () => {
  let engine: ContextIntelligenceEngine;
  let cache: ContextCache;

  beforeEach(() => {
    const knowledgeGateway = {}; 
    cache = new ContextCache();
    const estimator = new TokenCostEstimator();

    engine = new ContextIntelligenceEngine(
      new ContextGraphBuilder(knowledgeGateway),
      new TaskPolicyEngine(),
      new ContextFreshnessAnalyzer(),
      new ContextDiversityManager(),
      new ContextCompressor(estimator),
      new ContradictionDetector(),
      new ContextPackBuilder(estimator),
      cache,
      new KernelEventDispatcher(),
      knowledgeGateway
    );
  });

  const mockDecision: Decision = {
    decisionId: 'dec_123',
    action: 'PROCEED',
    intent: { type: IntentType.BUG_FIX, confidence: 0.9 },
    targetFeatures: ['feat_auth'],
    requiredContext: [
      { entityId: 'feat_auth', type: 'feature', category: 'REQUIRED', relevanceScore: 1.0, confidence: 1.0, reason: '', source: '', estimatedTokenCost: 1000 }
    ],
    recommendedContext: [
      { entityId: 'test_auth', type: 'feature', category: 'USEFUL', relevanceScore: 0.8, confidence: 1.0, reason: '', source: '', estimatedTokenCost: 1000 }
    ],
    optionalContext: [],
    excludedContext: [],
    affectedFeatures: [],
    affectedTests: [],
    risk: { score: 0.1, level: 'LOW', factors: [], evidence: [] },
    confidence: 0.95,
    reasons: []
  };

  it('should successfully build a Context Pack from a Decision', () => {
    const pack = engine.generateContextPack(mockDecision, 'repo_123', ContextMode.STANDARD, 50000);

    expect(pack.mode).toBe(ContextMode.STANDARD);
    expect(pack.sections.required.length).toBeGreaterThan(0);
    expect(pack.estimatedTokenCost).toBeGreaterThan(0);
  });

  it('should semantically compress context if over budget', () => {
    // Both items cost 1000 tokens (FULL). Budget is 1500.
    const pack = engine.generateContextPack(mockDecision, 'repo_123', ContextMode.STANDARD, 1500);

    // Instead of dropping the USEFUL context entirely, it should compress it to SUMMARY
    const totalTokens = pack.estimatedTokenCost;
    expect(totalTokens).toBeLessThanOrEqual(1500);
    
    // Check that at least one item was compressed
    const allItems = [...pack.sections.required, ...pack.sections.useful];
    const hasCompressed = allItems.some(i => i.data.compression === 'SUMMARY' || i.data.compression === 'METADATA');
    expect(hasCompressed).toBe(true);
  });

  it('should cache and retrieve identical Context Packs', () => {
    const pack1 = engine.generateContextPack(mockDecision, 'repo_123', ContextMode.STANDARD, 50000);
    const pack2 = engine.generateContextPack(mockDecision, 'repo_123', ContextMode.STANDARD, 50000);

    expect(pack1.packId).toBe(pack2.packId); // Should be the exact same cached object
  });

  it('should detect contradictions and raise ContextWarnings', () => {
    // Inject a fake Contradicts edge into the graph via the builder
    // Since we can't easily mock the builder internals here without a spy, we'll manually test the detector
    const detector = new ContradictionDetector();
    const warnings = detector.detect({
      nodes: [],
      edges: [{ sourceId: 'A', targetId: 'B', type: 'CONTRADICTS' }]
    });

    expect(warnings.length).toBe(1);
    expect(warnings[0].type).toBe('CONTRADICTION');
  });
});
