import { PolicyRule, PolicyLevel } from '../models/PolicyRule';
import { AgentAction } from '../../actions/models/AgentAction';

export class PolicyEngine {
  private policies: PolicyRule[] = [];

  public addPolicy(rule: PolicyRule): void {
    this.policies.push(rule);
    // Sort policies by level descending (SYSTEM first, then GLOBAL, etc)
    this.policies.sort((a, b) => b.level - a.level);
  }

  public evaluate(action: AgentAction): { decision: 'ALLOW' | 'REQUIRE_APPROVAL' | 'DENY', matched: PolicyRule[] } {
    let finalDecision: 'ALLOW' | 'REQUIRE_APPROVAL' | 'DENY' = 'ALLOW'; // default implicit allow for low-level
    const matched: PolicyRule[] = [];

    // Because policies are sorted Highest -> Lowest precedence, 
    // we evaluate them in order.
    for (const rule of this.policies) {
       if (this.matches(rule, action)) {
          matched.push(rule);
          
          // If a higher level rule says DENY, we immediately lock the decision to DENY.
          // Lower level rules CANNOT override a higher level DENY.
          if (rule.decision === 'DENY') {
             return { decision: 'DENY', matched };
          }
          
          // If a higher level says REQUIRE_APPROVAL, we can upgrade ALLOW to REQUIRE_APPROVAL,
          // but a lower level ALLOW cannot downgrade a REQUIRE_APPROVAL.
          if (rule.decision === 'REQUIRE_APPROVAL' && finalDecision === 'ALLOW') {
             finalDecision = 'REQUIRE_APPROVAL';
          }
       }
    }

    return { decision: finalDecision, matched };
  }

  private matches(rule: PolicyRule, action: AgentAction): boolean {
    const actionMatch = rule.action === '*' || rule.action === action.type;
    
    let targetMatch = false;
    if (typeof rule.targetPattern === 'string') {
       if (rule.targetPattern === '*') {
          targetMatch = true;
       } else {
          // Convert basic wildcards to regex for simple matching
          const regexStr = '^' + rule.targetPattern.split('*').join('.*') + '$';
          targetMatch = new RegExp(regexStr).test(action.target);
       }
    } else {
       targetMatch = rule.targetPattern.test(action.target);
    }

    return actionMatch && targetMatch;
  }
}
