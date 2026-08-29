import { CommitSnapshot } from '../models/CommitSnapshot';
import { ChangeImpact } from '../models/ChangeImpact';

export class ChangeImpactAnalyzer {
  public analyze(snapshot: CommitSnapshot): ChangeImpact {
    const symbolsChanged = snapshot.addedSymbolIds.length + snapshot.removedSymbolIds.length + snapshot.modifiedSymbolIds.length;
    const depsChanged = snapshot.addedDependencyIds.length + snapshot.removedDependencyIds.length;
    const featuresChanged = snapshot.addedFeatureIds.length + snapshot.removedFeatureIds.length; // Simplified

    let riskScore = 0.0;
    
    // Naive heuristic for blast radius
    riskScore += Math.min((symbolsChanged * 0.05), 0.4);
    riskScore += Math.min((depsChanged * 0.1), 0.3);
    riskScore += Math.min((featuresChanged * 0.15), 0.3);

    riskScore = Math.min(riskScore, 1.0);

    let estimatedImpact = 'Low';
    if (riskScore > 0.7) estimatedImpact = 'Critical';
    else if (riskScore > 0.4) estimatedImpact = 'High';
    else if (riskScore > 0.2) estimatedImpact = 'Medium';

    return {
      filesChangedCount: snapshot.changedFiles.length,
      symbolsChangedCount: symbolsChanged,
      featuresChangedCount: featuresChanged,
      dependenciesChangedCount: depsChanged,
      architectureViolationsAdded: 0, // Requires integration with boundary analyzer history
      architectureViolationsFixed: 0,
      riskScore,
      estimatedImpact
    };
  }
}
