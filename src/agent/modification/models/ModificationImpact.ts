export interface ModificationImpact {
  impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  affectedSymbols: string[];
  publicApiChanged: boolean;
  downstreamDependenciesAffected: number;
}
