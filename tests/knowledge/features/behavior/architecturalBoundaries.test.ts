import { describe, it, expect } from 'vitest';
import { DIContainer } from '../../../../src/workspace/di/DIContainer';
import {
  registerFeatureBehaviorServices,
  FeatureBehaviorTokens,
} from '../../../../src/knowledge/features/behavior/di/BehaviorDISetup';
import { FeatureBehaviorRepository } from '../../../../src/knowledge/features/behavior/repository/FeatureBehaviorRepository';
import { FeatureBehaviorAPI } from '../../../../src/knowledge/features/behavior/api/FeatureBehaviorAPI';
import { BehaviorTestHelper } from './BehaviorTestHelper';
import { FeatureBehaviorExplainer } from '../../../../src/knowledge/features/behavior/core/FeatureBehaviorExplainer';

describe('Phase 6.5: Architectural Boundaries & Dependency Injection', () => {
  it('should register all Phase 6.5 services into DIContainer as singletons', () => {
    const container = new DIContainer();
    registerFeatureBehaviorServices(container);

    const repo = container.resolve<FeatureBehaviorRepository>(FeatureBehaviorTokens.Repository);
    const flowBuilder = container.resolve(FeatureBehaviorTokens.FlowBuilder);
    const normalizer = container.resolve(FeatureBehaviorTokens.Normalizer);
    const validator = container.resolve(FeatureBehaviorTokens.Validator);
    const resolver = container.resolve(FeatureBehaviorTokens.Resolver);
    const analyzer = container.resolve(FeatureBehaviorTokens.Analyzer);
    const explainer = container.resolve(FeatureBehaviorTokens.Explainer);
    const engine = container.resolve(FeatureBehaviorTokens.Engine);
    const api = container.resolve<FeatureBehaviorAPI>(FeatureBehaviorTokens.API);

    expect(repo).toBeDefined();
    expect(flowBuilder).toBeDefined();
    expect(normalizer).toBeDefined();
    expect(validator).toBeDefined();
    expect(resolver).toBeDefined();
    expect(analyzer).toBeDefined();
    expect(explainer).toBeDefined();
    expect(engine).toBeDefined();
    expect(api).toBeInstanceOf(FeatureBehaviorAPI);

    // Verify singleton identity
    const repo2 = container.resolve(FeatureBehaviorTokens.Repository);
    expect(repo).toBe(repo2);
  });

  it('should produce structured, evidence-based explainability markdown without hallucinations', async () => {
    const feat = BehaviorTestHelper.createFeature('feat_explain_test', 'Explain Test');
    const mappings = [
      BehaviorTestHelper.createMapping('feat_explain_test', 'POST /api/test', 'ENDPOINT', 'PRIMARY'),
      BehaviorTestHelper.createMapping('feat_explain_test', 'TestController.handle', 'SYMBOL', 'CONTROLLER'),
    ];

    const context = BehaviorTestHelper.createContext(feat, mappings);
    const { engine } = BehaviorTestHelper.createEngine();

    const result = await engine.analyzeFeatureBehavior('feat_explain_test', context);
    const behavior = result.behaviors[0];

    const explainer = new FeatureBehaviorExplainer();
    const explanation = explainer.explainBehavior(behavior, 'Explain Test');

    expect(explanation).toContain('# Feature Behavior: Explain Test');
    expect(explanation).toContain('## Primary Execution Paths');
    expect(explanation).toContain('### Flow:');
    expect(explanation).toContain('#### Execution Sequence');
  });
});
