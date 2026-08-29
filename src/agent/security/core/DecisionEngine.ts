import { AgentAction } from '../../actions/models/AgentAction';
import { ActionGraph } from '../../actions/models/ActionGraph';
import { PolicyEngine } from './PolicyEngine';
import { ProtectionManager } from './ProtectionManager';
import { RiskGate } from './RiskGate';
import { ApprovalManager } from './ApprovalManager';
import { SecurityDecision } from '../models/SecurityDecision';
import { SecurityAuditLogger } from '../audit/SecurityAuditLogger';
import { PermissionSet } from '../models/PermissionSet';

export class DecisionEngine {
  constructor(
    private policyEngine: PolicyEngine,
    private protectionManager: ProtectionManager,
    private riskGate: RiskGate,
    private approvalManager: ApprovalManager,
    private auditLogger: SecurityAuditLogger,
    private globalPermissions: PermissionSet
  ) {}

  public evaluateGraph(graph: ActionGraph, agentId: string): SecurityDecision[] {
    const decisions: SecurityDecision[] = [];

    for (const action of graph.getAllActions()) {
      const decision = this.evaluateAction(action);
      decisions.push(decision);
      
      this.auditLogger.logDecision(agentId, action.taskId, action.planId, decision, action.parameters);
    }

    return decisions;
  }

  private evaluateAction(action: AgentAction): SecurityDecision {
    const reasons: string[] = [];
    let finalDecision: 'ALLOW' | 'REQUIRE_APPROVAL' | 'DENY' = 'ALLOW';

    // 1. Check Protected Resources
    const protectionDecision = this.protectionManager.evaluateProtection(action);
    if (protectionDecision === 'DENY') {
       return this.buildDecision(action, 'DENY', ['Target is a protected resource and action is strictly prohibited.'], []);
    }
    if (protectionDecision === 'REQUIRE_APPROVAL') {
       finalDecision = 'REQUIRE_APPROVAL';
       reasons.push('Target is a protected resource.');
    }

    // 2. Check Risk Gate
    const riskDecision = this.riskGate.evaluateRisk(action);
    if (riskDecision === 'REQUIRE_APPROVAL' && finalDecision === 'ALLOW') {
       finalDecision = 'REQUIRE_APPROVAL';
       reasons.push(`Action has ${action.risk} risk.`);
    }

    // 3. Evaluate Hierarchical Policies
    const policyEval = this.policyEngine.evaluate(action);
    
    if (policyEval.decision === 'DENY') {
       return this.buildDecision(action, 'DENY', ['Action denied by higher-level policy.'], policyEval.matched);
    }

    if (policyEval.decision === 'REQUIRE_APPROVAL' && finalDecision === 'ALLOW') {
       finalDecision = 'REQUIRE_APPROVAL';
       reasons.push('Action requires approval per policy rules.');
    }

    // 4. Generate Approval if needed
    if (finalDecision === 'REQUIRE_APPROVAL') {
       this.approvalManager.createRequest(action, reasons.join(' '));
    }

    if (finalDecision === 'ALLOW' && reasons.length === 0) {
       reasons.push('Action is safe and permitted.');
    }

    return this.buildDecision(action, finalDecision, reasons, policyEval.matched);
  }

  private buildDecision(action: AgentAction, decision: 'ALLOW' | 'REQUIRE_APPROVAL' | 'DENY', reasons: string[], matchedPolicies: import('../models/PolicyRule').PolicyRule[]): SecurityDecision {
    return {
      actionId: action.actionId,
      decision,
      risk: action.risk,
      reasons,
      matchedPolicies,
      requiredPermissions: [], // Derived in actual prod
      timestamp: Date.now()
    };
  }
}
