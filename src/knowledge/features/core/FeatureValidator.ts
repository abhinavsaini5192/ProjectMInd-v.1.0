import { Feature } from '../models/Feature';
import { InvalidFeatureError } from '../errors/InvalidFeatureError';
import { isValidFeatureId } from '../models/FeatureId';

export class FeatureValidator {
  public validate(feature: Feature): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    if (!feature.id || !isValidFeatureId(feature.id)) {
      issues.push(`Invalid Feature ID: "${feature.id}"`);
    }

    if (!feature.name || feature.name.trim().length === 0) {
      issues.push('Feature name cannot be empty');
    }

    if (!feature.scope || !feature.scope.repositoryId || !feature.scope.workspaceId) {
      issues.push('Feature must have a valid scope with workspaceId and repositoryId');
    }

    if (!feature.type) {
      issues.push('Feature must have a valid FeatureType');
    }

    if (!feature.status) {
      issues.push('Feature must have a valid FeatureStatus');
    }

    if (!feature.confidence || feature.confidence.score < 0 || feature.confidence.score > 1) {
      issues.push('Feature confidence score must be between 0.0 and 1.0');
    }

    // Validate cross-repository boundary references
    for (const ref of feature.references || []) {
      if (!ref.resourceId || ref.resourceId.trim().length === 0) {
        issues.push(`Invalid reference with empty resourceId: ${ref.referenceId}`);
      }
    }

    if (issues.length > 0) {
      throw new InvalidFeatureError(`Feature validation failed for "${feature.name}"`, issues);
    }

    return { valid: true, issues: [] };
  }
}
