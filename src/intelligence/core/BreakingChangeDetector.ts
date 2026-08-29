import { ASTChange, ChangeType } from '../models/RepositoryChange';
import { BreakingChange } from '../models/SpecificChanges';

export class BreakingChangeDetector {
  /**
   * Identifies breaking changes deterministically.
   * A breaking change is defined as:
   * 1. An exported symbol being deleted.
   * 2. An exported function/method signature changing (e.g. arguments removed or added).
   */
  public detect(astChanges: ASTChange[], exportedSymbols: Set<string>): BreakingChange[] {
    const breaking: BreakingChange[] = [];

    for (const change of astChanges) {
      if (!exportedSymbols.has(change.symbolName)) {
        continue; // Only changes to public/exported API matter
      }

      if (change.changeType === ChangeType.Deleted) {
        breaking.push({
          symbolName: change.symbolName,
          filePath: change.filePath,
          reason: `Exported symbol '${change.symbolName}' was removed.`,
          consumersAffected: [] // Left to ImpactAnalyzer to populate
        });
      } else if (change.changeType === ChangeType.Modified) {
        // Very basic heuristic: if previousSignature is not equal to newSignature, breaking change
        if (change.previousSignature && change.newSignature && change.previousSignature !== change.newSignature) {
           breaking.push({
            symbolName: change.symbolName,
            filePath: change.filePath,
            reason: `Signature of exported symbol '${change.symbolName}' changed.`,
            consumersAffected: []
          });
        }
      }
    }

    return breaking;
  }
}
