import { describe, it, expect } from 'vitest';
import { FeatureMappingScorer } from '../../../../src/knowledge/features/mapping/core/FeatureMappingScorer';
import { FeatureMappingResolver } from '../../../../src/knowledge/features/mapping/core/FeatureMappingResolver';
import type { MappingCandidate } from '../../../../src/knowledge/features/mapping/models/MappingCandidate';
import type { FeatureResourceMapping } from '../../../../src/knowledge/features/mapping/models/FeatureResourceMapping';

describe('Feature-to-Code Mapping: Scoring & Resolution', () => {
  const scorer = new FeatureMappingScorer();
  const resolver = new FeatureMappingResolver();

  describe('FeatureMappingScorer', () => {
    it('should calculate weighted score and grant diversity bonus for multi-source candidate', () => {
      const candidate: MappingCandidate = {
        candidateId: 'cand-1',
        featureId: 'feat_auth',
        resourceId: 'src/auth/AuthService.ts',
        resourceType: 'SYMBOL',
        proposedRole: 'IMPLEMENTATION',
        evidence: [
          {
            evidenceId: 'ev-sym',
            sourceType: 'SYMBOL',
            sourceId: 'AuthService',
            evidenceType: 'SYMBOL_FEATURE_ALIGNMENT',
            description: 'Symbol AuthService implements authentication',
            strength: 0.9,
            confidence: 0.85,
            metadata: {},
            timestamp: Date.now(),
          },
          {
            evidenceId: 'ev-test',
            sourceType: 'TEST',
            sourceId: 'tests/auth/auth.test.ts',
            evidenceType: 'FEATURE_TEST_VERIFICATION',
            description: 'Test suite tests AuthService',
            strength: 0.88,
            confidence: 0.8,
            metadata: {},
            timestamp: Date.now(),
          },
        ],
        score: 0.85,
        confidence: { level: 'HIGH', score: 0.85, reasons: [] },
        sources: ['SYMBOL', 'TEST'],
        conflicts: [],
        status: 'DETECTED',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const result = scorer.scoreCandidate(candidate);

      expect(result.score).toBeGreaterThan(0);
      expect(result.breakdown.symbolScore).toBeGreaterThan(0);
      expect(result.breakdown.testScore).toBeGreaterThan(0);
      expect(result.breakdown.coherenceScore).toBe(0.1); // Diversity bonus
      expect(result.confidence.reasons.some((r) => r.includes('diversity bonus'))).toBe(true);
    });
  });

  describe('FeatureMappingResolver', () => {
    it('should consolidate candidates, select dominant role, and aggregate evidence', () => {
      const cand1: MappingCandidate = {
        candidateId: 'cand-1',
        featureId: 'feat_auth',
        resourceId: 'src/auth/AuthController.ts',
        resourceType: 'FILE',
        proposedRole: 'IMPLEMENTATION',
        evidence: [
          {
            evidenceId: 'ev-1',
            sourceType: 'FILE',
            sourceId: 'src/auth/AuthController.ts',
            evidenceType: 'FILE_PATH_COHERENCE',
            description: 'File path match',
            strength: 0.8,
            confidence: 0.8,
            metadata: {},
            timestamp: Date.now(),
          },
        ],
        score: 0.8,
        confidence: { level: 'HIGH', score: 0.8, reasons: [] },
        sources: ['FILE'],
        conflicts: [],
        status: 'DETECTED',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const cand2: MappingCandidate = {
        candidateId: 'cand-2',
        featureId: 'feat_auth',
        resourceId: 'src/auth/AuthController.ts',
        resourceType: 'SYMBOL',
        proposedRole: 'ENTRY_POINT', // Higher priority than IMPLEMENTATION
        evidence: [
          {
            evidenceId: 'ev-2',
            sourceType: 'ENDPOINT',
            sourceId: 'POST /api/v1/auth/login',
            evidenceType: 'API_ENTRYPOINT',
            description: 'Exposes HTTP login endpoint',
            strength: 0.95,
            confidence: 0.95,
            metadata: {},
            timestamp: Date.now(),
          },
        ],
        score: 0.95,
        confidence: { level: 'VERY_HIGH', score: 0.95, reasons: [] },
        sources: ['ENDPOINT'],
        conflicts: [],
        status: 'DETECTED',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const { resolvedMappings } = resolver.resolve([cand1, cand2]);

      expect(resolvedMappings).toHaveLength(1);
      const resolved = resolvedMappings[0]!;
      expect(resolved.resourceId).toBe('src/auth/AuthController.ts');
      expect(resolved.role).toBe('ENTRY_POINT'); // Dominant role won
      expect(resolved.score).toBe(0.95);
      expect(resolved.evidence).toHaveLength(2); // Consolidated evidence
      expect(resolved.active).toBe(true);
    });

    it('should ignore candidates with status REJECTED', () => {
      const rejectedCand: MappingCandidate = {
        candidateId: 'cand-rej',
        featureId: 'feat_auth',
        resourceId: 'src/utils/math.ts',
        resourceType: 'FILE',
        proposedRole: 'SUPPORT',
        evidence: [],
        score: 0.2,
        confidence: { level: 'VERY_LOW', score: 0.2, reasons: [] },
        sources: ['FILE'],
        conflicts: [],
        status: 'REJECTED',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const { resolvedMappings } = resolver.resolve([rejectedCand]);
      expect(resolvedMappings).toHaveLength(0);
    });
  });
});
