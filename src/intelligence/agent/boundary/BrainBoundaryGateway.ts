import type { InformationRequest, InformationResponse } from '../models/InformationRequest';
import type { ActionProposal, ActionProposalDecision } from '../models/ActionProposal';
import { AgentSecurityError } from '../errors/AgentSecurityError';
import { AuditTrail } from '../observability/AuditTrail';

export interface RepositoryReader {
  readFile(path: string): Promise<string | null> | string | null;
  readSymbol(symbol: string): Promise<any | null> | any | null;
}

export class BrainBoundaryGateway {
  constructor(
    private reader?: RepositoryReader,
    private auditTrail?: AuditTrail
  ) {}

  /**
   * Handle an information request coming from Brain or Reasoning
   */
  public async handleInformationRequest(request: InformationRequest): Promise<InformationResponse> {
    this.auditTrail?.record({
      category: 'CONTEXT',
      action: 'INFORMATION_REQUEST',
      actor: 'AGENT',
      status: 'STARTED',
      details: { requestId: request.requestId, type: request.type, target: request.target },
    });

    if (!request.target || !request.type) {
      return {
        requestId: request.requestId,
        found: false,
        error: 'Target or type missing in InformationRequest',
      };
    }

    // Prohibit access to sensitive system paths
    const normalizedTarget = request.target.toLowerCase();
    if (
      normalizedTarget.includes('/etc/passwd') ||
      normalizedTarget.includes('/etc/shadow') ||
      normalizedTarget.includes('.ssh') ||
      normalizedTarget.includes('id_rsa') ||
      normalizedTarget.includes('.env')
    ) {
      this.auditTrail?.record({
        category: 'SECURITY',
        action: 'BLOCKED_SENSITIVE_TARGET',
        actor: 'AGENT',
        status: 'FAILED',
        details: { target: request.target },
      });
      throw new AgentSecurityError(
        `Access to sensitive target "${request.target}" is blocked by Brain boundary policy`,
        'UNAUTHORIZED_ACCESS'
      );
    }

    try {
      let content: string | undefined;
      let found = false;

      if (this.reader) {
        if (request.type === 'FILE' || request.type === 'CONFIGURATION') {
          const fileContent = await this.reader.readFile(request.target);
          if (fileContent !== null && fileContent !== undefined) {
            content = fileContent;
            found = true;
          }
        } else if (request.type === 'SYMBOL') {
          const sym = await this.reader.readSymbol(request.target);
          if (sym !== null && sym !== undefined) {
            content = typeof sym === 'string' ? sym : JSON.stringify(sym);
            found = true;
          }
        }
      }

      this.auditTrail?.record({
        category: 'CONTEXT',
        action: 'INFORMATION_REQUEST',
        actor: 'AGENT',
        status: 'COMPLETED',
        details: { requestId: request.requestId, found },
      });

      return {
        requestId: request.requestId,
        found,
        ...(content !== undefined ? { content } : {}),
      };
    } catch (err: any) {
      this.auditTrail?.record({
        category: 'ERROR',
        action: 'INFORMATION_REQUEST_FAILED',
        actor: 'AGENT',
        status: 'FAILED',
        details: { requestId: request.requestId, error: err.message },
      });
      return {
        requestId: request.requestId,
        found: false,
        error: err.message,
      };
    }
  }

  /**
   * Validate and triage an action proposal submitted by Brain
   */
  public evaluateActionProposal(proposal: ActionProposal, allowedActions?: string[]): ActionProposalDecision {
    this.auditTrail?.record({
      category: 'PLANNING',
      action: 'ACTION_PROPOSAL_EVALUATION',
      actor: 'AGENT',
      status: 'STARTED',
      details: { proposalId: proposal.proposalId, type: proposal.actionType, target: proposal.resourceUri },
    });

    if (allowedActions && !allowedActions.includes(proposal.actionType)) {
      return {
        proposalId: proposal.proposalId,
        approved: false,
        reason: `Action type "${proposal.actionType}" is not allowed under current boundary policy`,
      };
    }

    if (proposal.estimatedImpact === 'CRITICAL' && proposal.actionType === 'DELETE') {
      return {
        proposalId: proposal.proposalId,
        approved: false,
        reason: 'Critical destructive action requires explicit human approval',
      };
    }

    return {
      proposalId: proposal.proposalId,
      approved: true,
    };
  }
}
