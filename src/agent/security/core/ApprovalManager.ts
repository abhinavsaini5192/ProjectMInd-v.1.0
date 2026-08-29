import { ApprovalRequest } from '../models/ApprovalRequest';
import { AgentAction } from '../../actions/models/AgentAction';

export class ApprovalManager {
  private requests: Map<string, ApprovalRequest> = new Map();

  public createRequest(action: AgentAction, reason: string): ApprovalRequest {
    const request: ApprovalRequest = {
      approvalId: `app_${Date.now()}_${action.actionId}`,
      actionId: action.actionId,
      taskId: action.taskId,
      reason,
      risk: action.risk,
      requestedPermissions: [],
      expiration: Date.now() + 3600000 // 1 hour expiration
    };
    
    this.requests.set(request.approvalId, request);
    return request;
  }

  public getRequest(approvalId: string): ApprovalRequest | undefined {
    return this.requests.get(approvalId);
  }
}
