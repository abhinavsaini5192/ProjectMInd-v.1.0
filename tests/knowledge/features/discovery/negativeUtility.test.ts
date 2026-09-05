import { describe, it, expect } from 'vitest';
import { FeatureCandidateValidator } from '../../../../src/knowledge/features/discovery/core/FeatureCandidateValidator';
import { SymbolFeatureSource } from '../../../../src/knowledge/features/discovery/sources/SymbolFeatureSource';
import type { FeatureCandidate } from '../../../../src/knowledge/features/discovery/models/FeatureCandidate';
import { FeatureType } from '../../../../src/knowledge/features/models/FeatureType';

describe('Feature Discovery: Negative Utility & Low-Level Exclusion', () => {
  const validator = new FeatureCandidateValidator();

  it('should reject candidates named after generic utilities (logger, stringUtils, dateUtils)', () => {
    const utilityCandidateNames = [
      'logger',
      'loggerutil',
      'stringutils',
      'datehelper',
      'commonutils',
      'mathhelper',
    ];

    for (const name of utilityCandidateNames) {
      const candidate: FeatureCandidate = {
        candidateId: `cand_${name}`,
        proposedName: name,
        proposedDescription: `Utility for ${name}`,
        type: FeatureType.CROSS_CUTTING,
        scope: { workspaceId: 'ws-1', repositoryId: 'repo-1' },
        evidence: [
          {
            evidenceId: 'e1',
            sourceType: 'SYMBOL',
            sourceId: name,
            evidenceType: 'IMPLEMENTATION_SYMBOL',
            description: name,
            targetCapability: name,
            strength: 'WEAK',
            confidence: 0.3,
            timestamp: 1000,
          },
        ],
        score: 0.3,
        confidence: { level: 'LOW', score: 0.3, reasons: [] },
        sources: ['SYMBOL'],
        references: [],
        conflicts: [],
        status: 'DETECTED',
        createdAt: 1000,
        updatedAt: 1000,
      };

      const context = { workspaceId: 'ws-1', repositoryId: 'repo-1' };
      const result = validator.validate(candidate, context);

      expect(result.valid).toBe(false);
      expect(candidate.status).toBe('REJECTED');
      expect(result.issues.some((issue) => issue.includes('generic utility'))).toBe(true);
    }
  });

  it('SymbolFeatureSource should filter out pure generic utility symbols', async () => {
    const source = new SymbolFeatureSource();

    const symbols = [
      {
        id: 'sym_1',
        name: 'Logger',
        kind: 'ClassDeclaration',
        filePath: 'src/utils/logger.ts',
        exported: true,
      },
      {
        id: 'sym_2',
        name: 'formatDate',
        kind: 'FunctionDeclaration',
        filePath: 'src/utils/dateUtils.ts',
        exported: true,
      },
      {
        id: 'sym_3',
        name: 'OrderProcessor',
        kind: 'ClassDeclaration',
        filePath: 'src/orders/OrderProcessor.ts',
        exported: true,
      },
    ];

    const evidence = source.discover({
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
      symbols,
    });

    const targetCapabilities = evidence.map((e) => e.targetCapability);
    expect(targetCapabilities.some((c) => c.includes('Order'))).toBe(true);
    expect(targetCapabilities).not.toContain('Logger');
    expect(targetCapabilities).not.toContain('Date');
  });
});
