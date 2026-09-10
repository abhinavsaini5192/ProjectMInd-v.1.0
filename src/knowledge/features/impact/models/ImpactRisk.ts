import type { ImpactSeverity } from './ImpactSeverity.js';

export interface ImpactRisk {
  riskId: string;
  featureId: string;
  riskType: string;
  severity: ImpactSeverity;
  score: number;
  rationale: string;
  metadata?: Record<string, any>;
}
