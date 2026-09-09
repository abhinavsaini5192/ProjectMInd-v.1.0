import { SecuritySanitizer } from '../../../../intelligence/agent/hardening/SecuritySanitizer.js';
import type { HealthSignal } from '../models/HealthSignal.js';
import type { HealthSignalType } from '../models/HealthSignalType.js';
import type { HealthSignalSeverity } from '../models/HealthSignalSeverity.js';
import type { FeatureRiskEvidence } from '../models/FeatureRiskEvidence.js';

export class HealthSignalHelper {
  public static createSignal(params: {
    featureId: string;
    signalType: HealthSignalType;
    severity: HealthSignalSeverity;
    value: number | string | boolean;
    normalizedValue: number; // 0 to 100
    description: string;
    evidence: FeatureRiskEvidence[];
    source: string;
    confidence: number;
    knowledgeVersion?: string;
  }): HealthSignal {
    const sanitizedDesc = SecuritySanitizer.redactSecrets(params.description);
    const signalId = `sig_${params.featureId}_${params.signalType}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    return {
      signalId,
      featureId: params.featureId,
      signalType: params.signalType,
      severity: params.severity,
      value: typeof params.value === 'string' ? SecuritySanitizer.redactSecrets(params.value) : params.value,
      normalizedValue: Math.max(0, Math.min(100, Math.round(params.normalizedValue))),
      description: sanitizedDesc,
      evidence: params.evidence,
      source: params.source,
      confidence: Math.max(0, Math.min(1, params.confidence)),
      detectedAt: Date.now(),
      knowledgeVersion: params.knowledgeVersion || '6.6.0'
    };
  }

  public static createEvidence(params: {
    sourceType: string;
    sourceId: string;
    evidenceType: string;
    description: string;
    strength?: number;
    confidence?: number;
    metadata?: Record<string, unknown>;
  }): FeatureRiskEvidence {
    const sanitizedDesc = SecuritySanitizer.redactSecrets(params.description);
    return {
      evidenceId: `evi_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      sourceType: params.sourceType,
      sourceId: params.sourceId,
      evidenceType: params.evidenceType,
      description: sanitizedDesc,
      strength: params.strength !== undefined ? Math.max(0, Math.min(1, params.strength)) : 1.0,
      confidence: params.confidence !== undefined ? Math.max(0, Math.min(1, params.confidence)) : 1.0,
      metadata: params.metadata,
      timestamp: Date.now()
    };
  }
}
