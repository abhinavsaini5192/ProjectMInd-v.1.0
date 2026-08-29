import { describe, it, expect, beforeEach } from 'vitest';
import { DecisionEngine } from '../../../src/agent/security/core/DecisionEngine';
import { PolicyEngine } from '../../../src/agent/security/core/PolicyEngine';
import { ProtectionManager } from '../../../src/agent/security/core/ProtectionManager';
import { RiskGate } from '../../../src/agent/security/core/RiskGate';
import { ApprovalManager } from '../../../src/agent/security/core/ApprovalManager';
import { SecurityAuditLogger } from '../../../src/agent/security/audit/SecurityAuditLogger';
import { KernelEventDispatcher } from '../../../src/kernel/core/KernelEventDispatcher';
import { PermissionSet } from '../../../src/agent/security/models/PermissionSet';
import { ActionGraph } from '../../../src/agent/actions/models/ActionGraph';
import { AgentAction } from '../../../src/agent/actions/models/AgentAction';
import { ActionType } from '../../../src/agent/actions/models/ActionType';
import { PolicyLevel } from '../../../src/agent/security/models/PolicyRule';

describe('Security, Policy & Permission Engine (Phase 4.4)', () => {
  let decisionEngine: DecisionEngine;
  let policyEngine: PolicyEngine;
  let dispatcher: KernelEventDispatcher;

  beforeEach(() => {
    dispatcher = new KernelEventDispatcher();
    policyEngine = new PolicyEngine();
    decisionEngine = new DecisionEngine(
      policyEngine,
      new ProtectionManager(),
      new RiskGate(),
      new ApprovalManager(),
      new SecurityAuditLogger(dispatcher),
      new PermissionSet()
    );
  });

  const createAction = (actionId: string, type: ActionType, target: string, risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW', params: any = {}): AgentAction => ({
    actionId, taskId: 't1', planId: 'p1', stepId: 's1', type, target, parameters: params, dependencies: [], preconditions: [], expectedOutcome: '', provenance: '', risk, confidence: 1, createdAt: Date.now()
  });

  it('should DENY deletion of protected resources (.git)', () => {
    const graph = new ActionGraph();
    graph.addAction(createAction('a1', ActionType.DELETE_FILE, '.git/config'));

    const decisions = decisionEngine.evaluateGraph(graph, 'agent_1');
    expect(decisions[0].decision).toBe('DENY');
    expect(decisions[0].reasons[0]).toContain('protected resource');
  });

  it('should REQUIRE_APPROVAL for editing protected resources (.env)', () => {
    const graph = new ActionGraph();
    graph.addAction(createAction('a2', ActionType.EDIT_FILE, '.env'));

    const decisions = decisionEngine.evaluateGraph(graph, 'agent_1');
    expect(decisions[0].decision).toBe('REQUIRE_APPROVAL');
    expect(decisions[0].reasons[0]).toContain('protected resource');
  });

  it('should enforce policy hierarchy (SYSTEM DENY overrides PROJECT ALLOW)', () => {
    policyEngine.addPolicy({
      level: PolicyLevel.PROJECT,
      action: ActionType.DELETE_FILE,
      targetPattern: '*',
      decision: 'ALLOW',
      reason: 'Project allows deletes'
    });
    policyEngine.addPolicy({
      level: PolicyLevel.SYSTEM,
      action: ActionType.DELETE_FILE,
      targetPattern: 'src/core/*',
      decision: 'DENY',
      reason: 'System protects core files'
    });

    const graph = new ActionGraph();
    graph.addAction(createAction('a3', ActionType.DELETE_FILE, 'src/core/main.ts'));

    const decisions = decisionEngine.evaluateGraph(graph, 'agent_1');
    expect(decisions[0].decision).toBe('DENY');
    expect(decisions[0].matchedPolicies.length).toBeGreaterThan(0);
  });

  it('should trigger REQUIRE_APPROVAL based on RiskGate for HIGH risk actions', () => {
    const graph = new ActionGraph();
    graph.addAction(createAction('a4', ActionType.EDIT_FILE, 'src/ui/Button.tsx', 'HIGH'));

    const decisions = decisionEngine.evaluateGraph(graph, 'agent_1');
    expect(decisions[0].decision).toBe('REQUIRE_APPROVAL');
    expect(decisions[0].reasons[0]).toContain('HIGH risk');
  });

  it('should redact secrets in audit logger', () => {
    let capturedPayload: any;
    dispatcher.subscribe('ACTION_EVALUATED', (payload) => capturedPayload = payload);
    dispatcher.subscribe('ACTION_ALLOWED', (payload) => capturedPayload = payload);

    const graph = new ActionGraph();
    graph.addAction(createAction('a5', ActionType.READ_FILE, 'config.ts', 'LOW', { api_key: 'sk_live_12345', normal_param: 'test' }));

    decisionEngine.evaluateGraph(graph, 'agent_1');

    expect(capturedPayload).toBeDefined();
    expect(capturedPayload.parameters.normal_param).toBe('test');
    expect(capturedPayload.parameters.api_key).toBe('[REDACTED]');
  });
});
