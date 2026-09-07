import type { Feature } from '../../models/Feature';
import type { FeatureRelationshipCandidate } from '../models/FeatureRelationshipCandidate';
import type { FeatureRelationship } from '../models/FeatureRelationship';
import type { IFeatureRelationshipValidator } from '../interfaces/IFeatureRelationshipValidator';

export class FeatureRelationshipValidator implements IFeatureRelationshipValidator {
  public validateCandidate(
    candidate: FeatureRelationshipCandidate,
    allFeatures: Map<string, Feature>,
    repositoryId?: string
  ): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    // 1. Self-dependency check
    if (candidate.sourceFeatureId === candidate.targetFeatureId) {
      issues.push(`Self-dependency detected: Feature '${candidate.sourceFeatureId}' cannot depend on itself.`);
    }

    // 2. Source feature existence
    const sourceFeature = allFeatures.get(candidate.sourceFeatureId);
    if (!sourceFeature) {
      issues.push(`Source feature '${candidate.sourceFeatureId}' does not exist in registry.`);
    }

    // 3. Target feature existence
    const targetFeature = allFeatures.get(candidate.targetFeatureId);
    if (!targetFeature) {
      issues.push(`Target feature '${candidate.targetFeatureId}' does not exist in registry.`);
    }

    // 4. Scope consistency (repository boundary)
    if (sourceFeature && targetFeature) {
      const sourceRepo = sourceFeature.scope?.repositoryId;
      const targetRepo = targetFeature.scope?.repositoryId;
      if (sourceRepo && targetRepo && sourceRepo !== targetRepo) {
        issues.push(
          `Cross-repository dependency invalid: Source repository '${sourceRepo}' does not match Target repository '${targetRepo}'.`
        );
      }
      if (repositoryId) {
        if (sourceRepo && sourceRepo !== repositoryId) {
          issues.push(`Source feature repository '${sourceRepo}' does not match context repository '${repositoryId}'.`);
        }
        if (targetRepo && targetRepo !== repositoryId) {
          issues.push(`Target feature repository '${targetRepo}' does not match context repository '${repositoryId}'.`);
        }
      }
    }

    // 5. Evidence check
    if (!candidate.evidence || candidate.evidence.length === 0) {
      issues.push(`Candidate relationship between '${candidate.sourceFeatureId}' and '${candidate.targetFeatureId}' has no supporting evidence.`);
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  public validateRelationship(
    relationship: FeatureRelationship,
    allFeatures: Map<string, Feature>
  ): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    if (relationship.sourceFeatureId === relationship.targetFeatureId) {
      issues.push(`Self-dependency detected: Feature '${relationship.sourceFeatureId}' cannot have a relationship with itself.`);
    }

    if (!allFeatures.has(relationship.sourceFeatureId)) {
      issues.push(`Source feature '${relationship.sourceFeatureId}' does not exist in registry.`);
    }

    if (!allFeatures.has(relationship.targetFeatureId)) {
      issues.push(`Target feature '${relationship.targetFeatureId}' does not exist in registry.`);
    }

    if (!relationship.evidence || relationship.evidence.length === 0) {
      // For MANUAL relationships, empty evidence may be allowed or minimal
      if (relationship.source !== 'MANUAL') {
        issues.push(`Automated relationship '${relationship.relationshipId}' has no supporting evidence.`);
      }
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }
}
