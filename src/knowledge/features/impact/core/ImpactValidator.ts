import type { IImpactValidator, ValidationResult, SecurityCheckResult } from '../interfaces/IImpactValidator.js';
import type { ImpactCandidate } from '../models/ImpactCandidate.js';
import type { ImpactConflict } from '../models/ImpactConflict.js';
import type { ImpactContext } from '../interfaces/IImpactSource.js';
import { SecuritySanitizer } from '../../../../intelligence/agent/hardening/SecuritySanitizer.js';
import { ChangeSourceHelper } from '../sources/ChangeSource.js';

export class ImpactValidator implements IImpactValidator {
  public validateCandidate(candidate: ImpactCandidate, context: ImpactContext): ValidationResult {
    const errors: string[] = [];

    if (!candidate.candidateId) {
      errors.push('Candidate missing candidateId.');
    }
    if (!candidate.targetFeatureId && !candidate.targetResourceId) {
      errors.push('Candidate must have either targetFeatureId or targetResourceId.');
    }
    if (candidate.score !== undefined && (candidate.score < 0 || candidate.score > 100)) {
      errors.push(`Invalid score ${candidate.score}: must be between 0 and 100.`);
    }
    if (candidate.distance < 0) {
      errors.push(`Invalid distance ${candidate.distance}: cannot be negative.`);
    }
    if (!candidate.evidence || candidate.evidence.length === 0) {
      errors.push('Candidate must contain at least one piece of evidence.');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  public detectConflicts(candidates: ImpactCandidate[], context: ImpactContext): ImpactConflict[] {
    const conflicts: ImpactConflict[] = [];

    // Check for conflicting evidence between dependency and behavior graphs (Section 32 & Case 11)
    for (const cand of candidates) {
      if (!cand.targetFeatureId) continue;

      const hasDependencyEvidence = cand.evidence.some((e) => e.source === 'DEPENDENCY');
      const hasBehaviorEvidence = cand.evidence.some((e) => e.source === 'BEHAVIOR');

      // Check if behavior graph indicates a bypass or alternative flow
      const behavior = context.behaviors.get(cand.targetFeatureId);
      if (hasDependencyEvidence && behavior) {
        // If an alternative flow explicitly marks bypass or has contradictory metadata
        const hasBypassFlow = behavior.flows.some((f: any) =>
          f.metadata?.bypassesDependency === true ||
          f.name.toLowerCase().includes('bypass') ||
          (cand.contributingChanges[0]?.name && f.nodes.some((n: any) => n.metadata?.conditions?.includes('skip_auth')))
        );

        if (hasBypassFlow) {
          const depEvidence = cand.evidence.find((e) => e.source === 'DEPENDENCY')!;
          const conflictEvidence = ChangeSourceHelper.createEvidence({
            source: 'BEHAVIOR',
            sourceId: (behavior as any).behaviorId || cand.targetFeatureId,
            evidenceType: 'BEHAVIORAL_BYPASS_CONTRADICTION',
            description: `Behavior graph indicates feature "${cand.targetFeatureId}" contains bypass flows that do not invoke the dependency.`,
            confidence: 0.85,
          });

          conflicts.push({
            conflictId: `conf_${cand.targetFeatureId}_${Date.now()}`,
            targetFeatureId: cand.targetFeatureId,
            conflictType: 'DEPENDENCY_VS_BEHAVIOR_BYPASS',
            competingEvidence: [depEvidence, conflictEvidence],
            severity: 'MEDIUM',
            confidence: 0.85,
            resolutionStatus: 'UNRESOLVED',
            resolutionNotes: `Dependency graph asserts relationship, but behavior flow model reveals bypass execution path.`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
        }
      }
    }

    return conflicts;
  }

  public validateSecurity(input: string): SecurityCheckResult {
    try {
      const check = SecuritySanitizer.checkPromptInjection(input, false);
      if (check.detected) {
        return {
          safe: false,
          detectedPatterns: check.matches,
          sanitizedText: SecuritySanitizer.redactSecrets(input),
        };
      }
      return {
        safe: true,
        detectedPatterns: [],
        sanitizedText: SecuritySanitizer.redactSecrets(input),
      };
    } catch (err: any) {
      return {
        safe: false,
        detectedPatterns: [err.message || 'PROMPT_INJECTION'],
        sanitizedText: SecuritySanitizer.redactSecrets(input),
      };
    }
  }
}
