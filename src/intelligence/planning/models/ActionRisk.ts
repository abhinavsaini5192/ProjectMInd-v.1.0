export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ActionRisk {
  level: RiskLevel;
  factors: string[];
  mitigation?: string;
}
