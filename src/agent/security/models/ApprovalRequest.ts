import { AgentPermission } from './AgentPermission';

export interface ApprovalRequest {
  approvalId: string;
  actionId: string;
  taskId: string;
  reason: string;
  risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  requestedPermissions: AgentPermission[];
  expiration: number;
}
