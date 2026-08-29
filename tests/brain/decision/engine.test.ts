import { describe, it, expect, beforeEach } from 'vitest';
import { DecisionEngine } from '../../../src/brain/decision/core/DecisionEngine';
import { IntentAnalyzer } from '../../../src/brain/decision/analyzers/IntentAnalyzer';
import { ImpactAnalyzer } from '../../../src/brain/decision/analyzers/ImpactAnalyzer';
import { RiskAnalyzer } from '../../../src/brain/decision/analyzers/RiskAnalyzer';
import { TaskDecomposer } from '../../../src/brain/decision/planners/TaskDecomposer';
import { FeatureResolver } from '../../../src/brain/decision/planners/FeatureResolver';
import { ContextPlanner } from '../../../src/brain/decision/planners/ContextPlanner';
import { ContextRanker } from '../../../src/brain/decision/planners/ContextRanker';
import { ContextBudgetOptimizer } from '../../../src/brain/decision/planners/ContextBudgetOptimizer';
import { DecisionExplainer } from '../../../src/brain/decision/explainers/DecisionExplainer';
import { KernelEventDispatcher } from '../../../src/kernel/core/KernelEventDispatcher';
import { IntentType } from '../../../src/brain/decision/models/Intent';

describe('Decision Engine Core (L3.1)', () => {
  let engine: DecisionEngine;

  beforeEach(() => {
    const knowledgeGateway = {}; // mock
    engine = new DecisionEngine(
      new IntentAnalyzer(),
      new TaskDecomposer(),
      new FeatureResolver(knowledgeGateway),
      new ContextPlanner(knowledgeGateway),
      new ContextRanker(),
      new ContextBudgetOptimizer(),
      new ImpactAnalyzer(knowledgeGateway),
      new RiskAnalyzer(),
      new DecisionExplainer(),
      new KernelEventDispatcher(),
      knowledgeGateway
    );
  });

  it('should successfully generate a Context Plan for a bug fix task', () => {
    const task = 'Fix the JWT token bug in the auth controller';
    const decision = engine.processUserTask(task, 'repo_123');

    expect(decision.intent.type).toBe(IntentType.BUG_FIX);
    expect(decision.targetFeatures).toContain('feat_auth');
    
    // Impact should have flagged dependent features
    expect(decision.affectedFeatures).toContain('feat_profile');
    
    // Risk should be high due to auth modification
    expect(decision.risk.level).toBe('CRITICAL');

    // Context should contain the required target feature
    expect(decision.requiredContext.length).toBeGreaterThan(0);
    expect(decision.requiredContext[0].entityId).toBe('feat_auth');

    // Explainability check
    expect(decision.reasons.length).toBeGreaterThan(0);
    expect(decision.reasons[0]).toContain('BUG_FIX');
  });

  it('should optimize context based on budget', () => {
    const task = 'Add stripe support to the payment page';
    
    // Set a very low budget (e.g., 600 tokens)
    const decision = engine.processUserTask(task, 'repo_123', 600);

    expect(decision.intent.type).toBe(IntentType.FEATURE_ADD);
    expect(decision.targetFeatures).toContain('feat_payment');
    
    // Required context (500 tokens) should make it, but USEFUL context (1000 tokens) should be dropped
    expect(decision.requiredContext.length).toBe(1);
    expect(decision.recommendedContext.length).toBe(0); 
  });

  it('should explicitly enforce security policy by excluding sensitive context', () => {
    const task = 'Modify auth feature';
    const decision = engine.processUserTask(task, 'repo_123');

    // 'sym_aws_secret' was added as EXCLUDED by ContextPlanner
    expect(decision.excludedContext.length).toBe(1);
    expect(decision.excludedContext[0].entityId).toBe('sym_aws_secret');
    expect(decision.excludedContext[0].reason).toContain('Security Policy');
  });
});
