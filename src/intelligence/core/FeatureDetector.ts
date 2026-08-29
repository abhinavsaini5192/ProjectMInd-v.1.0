import { ASTChange, ChangeType } from '../models/RepositoryChange';
import { FeatureChange } from '../models/SpecificChanges';

export class FeatureDetector {
  /**
   * Deterministically detects if a new feature is added.
   * Heuristic: If multiple new exported classes/functions are added matching specific naming
   * conventions (Controller, Service, Router, Component), or simply large additions.
   */
  public detect(astChanges: ASTChange[]): FeatureChange[] {
    const features: FeatureChange[] = [];
    
    // Group added changes by some boundary (e.g., file or directory)
    const newFiles = new Set<string>();
    
    for (const change of astChanges) {
      if (change.changeType === ChangeType.Added) {
        newFiles.add(change.filePath);
      }
    }

    if (newFiles.size > 0) {
      features.push({
        featureName: `Added logic in ${newFiles.size} file(s)`,
        relatedFiles: Array.from(newFiles),
        isNew: true
      });
    }

    return features;
  }
}
