import { describe, it, expect } from 'vitest';
import { BrainBoundaryGateway } from '../../../src/intelligence/agent/boundary/BrainBoundaryGateway';
import type { RepositoryReader } from '../../../src/intelligence/agent/boundary/BrainBoundaryGateway';
import type { InformationRequest } from '../../../src/intelligence/agent/models/InformationRequest';
import type { ActionProposal } from '../../../src/intelligence/agent/models/ActionProposal';
import { AgentSecurityError } from '../../../src/intelligence/agent/errors/AgentSecurityError';
import { AuditTrail } from '../../../src/intelligence/agent/observability/AuditTrail';

describe('ProjectMindAgent: Brain Boundary Protocol & Triage', () => {
  const mockReader: RepositoryReader = {
    readFile: async (path: string) => {
      if (path === 'src/index.ts') return 'console.log("hello");';
      return null;
    },
    readSymbol: async (symbol: string) => {
      if (symbol === 'MyClass') return { kind: 'class', name: 'MyClass' };
      return null;
    },
  };

  it('should successfully handle valid InformationRequests via boundary reader', async () => {
    const auditTrail = new AuditTrail();
    const gateway = new BrainBoundaryGateway(mockReader, auditTrail);

    const fileReq: InformationRequest = {
      requestId: 'info-1',
      type: 'FILE',
      target: 'src/index.ts',
      reason: 'Inspect entrypoint',
      urgency: 'MEDIUM',
    };

    const response = await gateway.handleInformationRequest(fileReq);
    expect(response.found).toBe(true);
    expect(response.content).toBe('console.log("hello");');

    const symbolReq: InformationRequest = {
      requestId: 'info-2',
      type: 'SYMBOL',
      target: 'MyClass',
      reason: 'Find symbol declaration',
      urgency: 'LOW',
    };

    const symResponse = await gateway.handleInformationRequest(symbolReq);
    expect(symResponse.found).toBe(true);
    expect(symResponse.content).toContain('MyClass');
  });

  it('should block sensitive files and throw AgentSecurityError', async () => {
    const gateway = new BrainBoundaryGateway(mockReader);

    const maliciousReqs = [
      { target: '/etc/passwd', type: 'FILE' },
      { target: '.env', type: 'CONFIGURATION' },
      { target: '~/.ssh/id_rsa', type: 'FILE' },
    ];

    for (const req of maliciousReqs) {
      await expect(
        gateway.handleInformationRequest({
          requestId: 'malicious',
          target: req.target,
          type: req.type as any,
          reason: 'exfiltration attempt',
          urgency: 'HIGH',
        })
      ).rejects.toThrow(AgentSecurityError);
    }
  });

  it('should evaluate ActionProposal and reject forbidden or critical actions', () => {
    const gateway = new BrainBoundaryGateway();

    const allowedProposal: ActionProposal = {
      proposalId: 'prop-1',
      actionType: 'CREATE',
      resourceUri: 'src/utils.ts',
      intent: 'Add helper functions',
      estimatedImpact: 'LOW',
    };

    const decision1 = gateway.evaluateActionProposal(allowedProposal, ['CREATE', 'MODIFY']);
    expect(decision1.approved).toBe(true);

    const disallowedProposal: ActionProposal = {
      proposalId: 'prop-2',
      actionType: 'DELETE',
      resourceUri: 'src/core.ts',
      intent: 'Delete core logic',
      estimatedImpact: 'LOW',
    };

    const decision2 = gateway.evaluateActionProposal(disallowedProposal, ['CREATE', 'MODIFY']);
    expect(decision2.approved).toBe(false);
    expect(decision2.reason).toContain('is not allowed under current boundary policy');

    const criticalDelete: ActionProposal = {
      proposalId: 'prop-3',
      actionType: 'DELETE',
      resourceUri: 'src/all.ts',
      intent: 'Nuke repository',
      estimatedImpact: 'CRITICAL',
    };

    const decision3 = gateway.evaluateActionProposal(criticalDelete, ['CREATE', 'MODIFY', 'DELETE']);
    expect(decision3.approved).toBe(false);
    expect(decision3.reason).toContain('requires explicit human approval');
  });
});
