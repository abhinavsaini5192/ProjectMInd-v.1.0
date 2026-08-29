export interface ChangeImpact {
  filesChangedCount: number;
  symbolsChangedCount: number;
  featuresChangedCount: number;
  dependenciesChangedCount: number;
  architectureViolationsAdded: number;
  architectureViolationsFixed: number;
  riskScore: number; // 0.0 to 1.0
  estimatedImpact: string; // 'Low', 'Medium', 'High', 'Critical'
}
