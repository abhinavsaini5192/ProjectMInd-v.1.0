import { SecuritySanitizer } from '../../../../intelligence/agent/hardening/SecuritySanitizer.js';
import type { FeatureHealth } from '../models/FeatureHealth.js';
import { isFeatureHealthStatus } from '../models/FeatureHealthStatus.js';
import { isFeatureRiskSeverity } from '../models/FeatureRiskSeverity.js';
import { isFeatureRiskType } from '../models/FeatureRiskType.js';
import { isFeatureHealthDimension, FEATURE_HEALTH_DIMENSIONS } from '../models/FeatureHealthDimension.js';
import { HealthValidationError } from '../errors/HealthValidationError.js';

export class FeatureHealthValidator {
  public static validateFeatureHealth(health: FeatureHealth): string[] {
    const errors: string[] = [];

    if (!health.healthId || typeof health.healthId !== 'string') {
      errors.push('FeatureHealth must have a non-empty string "healthId".');
    }

    if (!health.featureId || typeof health.featureId !== 'string') {
      errors.push('FeatureHealth must have a non-empty string "featureId".');
    }

    // Health score validation
    if (!health.healthScore) {
      errors.push('FeatureHealth must contain "healthScore".');
    } else {
      if (
        typeof health.healthScore.overallScore !== 'number' ||
        health.healthScore.overallScore < 0 ||
        health.healthScore.overallScore > 100
      ) {
        errors.push('Overall health score must be a number between 0 and 100.');
      }
      if (!isFeatureHealthStatus(health.healthScore.status)) {
        errors.push(`Invalid health status: "${health.healthScore.status}".`);
      }

      // Check all 10 dimensions
      if (!health.healthScore.dimensionScores) {
        errors.push('healthScore must contain "dimensionScores".');
      } else {
        for (const dim of FEATURE_HEALTH_DIMENSIONS) {
          const dimRes = health.healthScore.dimensionScores[dim];
          if (!dimRes) {
            errors.push(`Missing dimension score for ${dim}.`);
          } else {
            if (!isFeatureHealthDimension(dimRes.dimension)) {
              errors.push(`Invalid dimension name "${dimRes.dimension}".`);
            }
            if (typeof dimRes.score !== 'number' || dimRes.score < 0 || dimRes.score > 100) {
              errors.push(`Dimension ${dim} score must be between 0 and 100.`);
            }
          }
        }
      }
    }

    // Risk assessment validation
    if (!health.riskAssessment) {
      errors.push('FeatureHealth must contain "riskAssessment".');
    } else {
      if (
        typeof health.riskAssessment.overallRiskScore !== 'number' ||
        health.riskAssessment.overallRiskScore < 0 ||
        health.riskAssessment.overallRiskScore > 100
      ) {
        errors.push('Overall risk score must be a number between 0 and 100.');
      }
      if (!isFeatureRiskSeverity(health.riskAssessment.highestRiskSeverity)) {
        errors.push(`Invalid highest risk severity: "${health.riskAssessment.highestRiskSeverity}".`);
      }

      for (const risk of health.riskAssessment.risks || []) {
        if (!isFeatureRiskType(risk.riskType)) {
          errors.push(`Invalid risk type: "${risk.riskType}".`);
        }
        if (!isFeatureRiskSeverity(risk.severity)) {
          errors.push(`Invalid risk severity: "${risk.severity}".`);
        }
        if (typeof risk.score !== 'number' || risk.score < 0 || risk.score > 100) {
          errors.push(`Risk ${risk.riskId} score must be between 0 and 100.`);
        }
      }
    }

    // Criticality validation
    if (!health.criticality || typeof health.criticality.score !== 'number') {
      errors.push('FeatureHealth must contain valid "criticality".');
    } else if (health.criticality.score < 0 || health.criticality.score > 100) {
      errors.push('Criticality score must be between 0 and 100.');
    }

    // Stability validation
    if (!health.stability || typeof health.stability.score !== 'number') {
      errors.push('FeatureHealth must contain valid "stability".');
    } else if (health.stability.score < 0 || health.stability.score > 100) {
      errors.push('Stability score must be between 0 and 100.');
    }

    // Verification quality validation
    if (!health.verificationQuality || typeof health.verificationQuality.score !== 'number') {
      errors.push('FeatureHealth must contain valid "verificationQuality".');
    } else if (health.verificationQuality.score < 0 || health.verificationQuality.score > 100) {
      errors.push('Verification quality score must be between 0 and 100.');
    }

    // Security check: prompt injection in recommendations or descriptions
    for (const rec of health.recommendations || []) {
      const injection = SecuritySanitizer.checkPromptInjection(
        `${rec.title} ${rec.description} ${(rec.actionableSteps || []).join(' ')}`,
        false
      );
      if (injection.detected) {
        errors.push(`Security check failed: Suspicious prompt injection pattern detected in recommendation ${rec.recommendationId}.`);
      }
    }

    return errors;
  }

  public static assertValidFeatureHealth(health: FeatureHealth): void {
    const errors = this.validateFeatureHealth(health);
    if (errors.length > 0) {
      throw new HealthValidationError(
        `FeatureHealth validation failed with ${errors.length} error(s): ${errors.join('; ')}`,
        errors,
        { healthId: health.healthId, featureId: health.featureId }
      );
    }
  }
}
