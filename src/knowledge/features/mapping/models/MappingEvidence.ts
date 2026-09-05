import type { MappingResourceType } from './MappingResourceType';

export interface MappingEvidence {
  evidenceId: string;
  mappingId?: string;
  sourceType: MappingResourceType;
  sourceId: string;
  evidenceType: string;
  description: string;
  strength: number;
  confidence: number;
  metadata?: Record<string, any>;
  timestamp: number;
}
