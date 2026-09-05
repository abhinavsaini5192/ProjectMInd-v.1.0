import type { FeatureReference } from '../../models/FeatureReference';
import type { DiscoverySourceType } from './DiscoverySource';

export type EvidenceStrength = 'VERY_STRONG' | 'STRONG' | 'MEDIUM' | 'WEAK';

export interface DiscoveryEvidence {
  evidenceId: string;
  candidateId?: string;
  sourceType: DiscoverySourceType;
  sourceId: string;
  evidenceType: string;
  description: string;
  targetCapability: string;
  strength: EvidenceStrength;
  confidence: number;
  resourceReference?: FeatureReference;
  timestamp: number;
  metadata?: Record<string, any>;
}
