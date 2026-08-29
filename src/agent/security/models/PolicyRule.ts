import { ActionType } from '../../actions/models/ActionType';
import { AgentPermission } from './AgentPermission';

export enum PolicyLevel {
  SYSTEM = 100,
  GLOBAL = 80,
  PROJECT = 60,
  AGENT = 40,
  TASK = 20
}

export interface PolicyRule {
  level: PolicyLevel;
  action: ActionType | '*';
  targetPattern: string | RegExp;
  decision: 'ALLOW' | 'REQUIRE_APPROVAL' | 'DENY';
  requiredPermissions?: AgentPermission[];
  riskThreshold?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reason: string;
}
