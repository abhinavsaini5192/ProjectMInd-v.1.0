import { describe, it, expect } from 'vitest';
import { BehaviorTestHelper } from './BehaviorTestHelper';

describe('Phase 6.5: Control Flow Branching', () => {
  it('should identify conditional decision nodes with true and false branching paths', async () => {
    const authFeature = BehaviorTestHelper.createFeature('feat_auth_guard', 'Auth Guard');

    const mappings = [
      BehaviorTestHelper.createMapping('feat_auth_guard', 'PasswordValidator.verify', 'SYMBOL', 'PRIMARY', {
        hasBranches: true,
      }),
      BehaviorTestHelper.createMapping('feat_auth_guard', 'SessionManager.createSession', 'SYMBOL', 'SERVICE'),
    ];

    const context = BehaviorTestHelper.createContext(authFeature, mappings);
    const { engine } = BehaviorTestHelper.createEngine();

    const result = await engine.analyzeFeatureBehavior('feat_auth_guard', context);

    expect(result.behaviors.length).toBe(1);
    const behavior = result.behaviors[0];

    // Find the alternative decision flow
    const decisionFlow = behavior.flows.find(f => f.name.includes('Decision Flow') || f.flowType === 'ALTERNATIVE');
    expect(decisionFlow).toBeDefined();

    // Verify condition node
    const conditionNode = decisionFlow?.nodes.find(n => n.stepType === 'CONDITION');
    expect(conditionNode).toBeDefined();
    expect(conditionNode?.metadata?.conditions).toContain('true');
    expect(conditionNode?.metadata?.conditions).toContain('false');

    // Verify branching edges
    const trueEdge = decisionFlow?.edges.find(e => e.condition === 'condition == true');
    const falseEdge = decisionFlow?.edges.find(e => e.condition === 'condition == false');

    expect(trueEdge).toBeDefined();
    expect(falseEdge).toBeDefined();
    expect(falseEdge?.relationType).toBe('FAILS_TO');
  });
});
