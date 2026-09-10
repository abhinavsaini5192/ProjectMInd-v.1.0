import type { ImpactSource } from './ImpactSource.js';

export interface ImpactEvidence {
  evidenceId: string;
  source: ImpactSource;
  sourceId: string;
  evidenceType: string;
  description: string;
  confidence: number;
  metadata?: Record<string, any>;
}
