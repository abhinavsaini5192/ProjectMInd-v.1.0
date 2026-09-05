import type { MappingCandidate } from '../models/MappingCandidate';
import { MappingMatcher } from '../sources/MappingMatcher';

export interface ValidationResult {
  valid: boolean;
  issues: string[];
}

export class FeatureMappingValidator {
  private static readonly DISALLOWED_GENERIC_PATTERNS = [
    /^(utils?|helpers?|common|misc|types|index)$/i,
    /^(date|string|math|array|object)utils?$/i,
    /^(logger|logging|consolelogger)$/i,
  ];

  /**
   * Validate candidate resource link, scope, and semantic legitimacy
   */
  public validateCandidate(candidate: MappingCandidate, repositoryId?: string): ValidationResult {
    const issues: string[] = [];

    // 1. Resource ID check
    if (!candidate.resourceId || candidate.resourceId.trim().length === 0) {
      issues.push('Candidate resourceId is missing or empty');
    }

    // 2. Feature ID check
    if (!candidate.featureId || candidate.featureId.trim().length === 0) {
      issues.push('Candidate featureId is missing or empty');
    }

    // 3. Evidence check
    if (!candidate.evidence || candidate.evidence.length === 0) {
      issues.push(`Candidate "${candidate.resourceId}" contains zero evidence`);
    }

    // 4. Minimum score threshold check
    if (candidate.score < 0.20) {
      issues.push(`Candidate score (${candidate.score.toFixed(2)}) is below minimum acceptable threshold (0.20)`);
    }

    // 5. Negative Utility check: generic utility files with weak naming
    if (MappingMatcher.isGenericUtility(candidate.resourceId)) {
      issues.push(`Resource "${candidate.resourceId}" represents a pure generic utility rather than a feature implementation`);
    }

    // Check if filename is purely a generic utility (e.g. authentication-utils.ts)
    const baseName = candidate.resourceId.split('/').pop() || candidate.resourceId;
    const cleanBase = baseName.replace(/\.[^/.]+$/, '').toLowerCase();
    if (cleanBase.endsWith('-utils') || cleanBase.endsWith('_utils') || cleanBase.endsWith('utils')) {
      if (candidate.sources.length === 1 && candidate.sources[0] === 'FILE' && candidate.score < 0.70) {
        issues.push(`Resource "${candidate.resourceId}" appears to be a generic utility with only filename similarity`);
      }
    }

    const valid = issues.length === 0;
    candidate.status = valid ? 'VALIDATED' : 'REJECTED';

    return { valid, issues };
  }
}
