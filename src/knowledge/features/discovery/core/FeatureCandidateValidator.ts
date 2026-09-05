import type { FeatureCandidate } from '../models/FeatureCandidate';
import type { DiscoveryContext } from '../models/DiscoverySource';

export interface ValidationResult {
  valid: boolean;
  issues: string[];
}

export class FeatureCandidateValidator {
  private static readonly DISALLOWED_GENERIC_NAMES = new Set([
    'utils',
    'util',
    'stringutils',
    'dateutils',
    'mathutils',
    'logger',
    'logging',
    'helpers',
    'helper',
    'common',
    'misc',
    'index',
    'types',
  ]);

  /**
   * Validate candidate scope, evidence richness, and semantic legitimacy
   */
  public validate(candidate: FeatureCandidate, context: DiscoveryContext): ValidationResult {
    const issues: string[] = [];

    // 1. Scope check
    if (candidate.scope.repositoryId !== context.repositoryId) {
      issues.push(`Scope mismatch: candidate belongs to repo "${candidate.scope.repositoryId}" but current discovery is for "${context.repositoryId}"`);
    }

    // 2. Negative test: Disallow pure generic utilities from becoming features
    const normalizedName = candidate.proposedName.toLowerCase().replace(/[\s_-]+/g, '');
    const isGeneric =
      FeatureCandidateValidator.DISALLOWED_GENERIC_NAMES.has(normalizedName) ||
      /(util|utils|helper|helpers|logger|logging)$/i.test(normalizedName) ||
      /^(logger|logging|log|util|helper|common|misc|types|index)/i.test(normalizedName);

    if (isGeneric) {
      issues.push(`Candidate "${candidate.proposedName}" represents a generic utility rather than a domain capability`);
      candidate.status = 'REJECTED';
    }

    // 3. Evidence check
    if (!candidate.evidence || candidate.evidence.length === 0) {
      issues.push(`Candidate "${candidate.proposedName}" contains zero evidence`);
    }

    // 4. Minimum score check
    if (candidate.score < 0.20) {
      issues.push(`Candidate score (${candidate.score.toFixed(2)}) is below minimum threshold (0.20)`);
    }

    // 5. Critical conflict check
    const hasCriticalConflict = candidate.conflicts.some((c) => c.severity === 'CRITICAL' && !c.resolved);
    if (hasCriticalConflict) {
      issues.push(`Candidate has unresolved CRITICAL conflicts`);
    }

    const valid = issues.length === 0;
    candidate.status = valid ? 'VALIDATED' : 'REJECTED';

    return { valid, issues };
  }
}
