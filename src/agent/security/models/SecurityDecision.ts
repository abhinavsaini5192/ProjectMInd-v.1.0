import { AgentPermission } from './AgentPermission';
import { PolicyRule } from './PolicyRule';

export interface SecurityDecision {
  actionId: string;
  decision: 'ALLOW' | 'REQUIRE_APPROVAL' | 'DENY';
  risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reasons: string[];
  matchedPolicies: PolicyRule[];
  requiredPermissions: AgentPermission[];
  timestamp: number;
}
