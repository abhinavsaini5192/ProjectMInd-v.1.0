import { ASTChange, ChangeType } from '../models/RepositoryChange';
import { Refactor } from '../models/SpecificChanges';

export class RefactorDetector {
  /**
   * Deterministically detects a pure refactor.
   * A pure refactor means the AST nodes changed bodies, but NO signatures changed,
   * and no exported symbols were added or removed.
   */
  public detect(astChanges: ASTChange[], exportedSymbols: Set<string>): Refactor[] {
    const refactors: Refactor[] = [];
    
    const affectedFiles = new Set<string>();
    let isPure = true;

    for (const change of astChanges) {
      affectedFiles.add(change.filePath);

      if (exportedSymbols.has(change.symbolName)) {
        if (change.changeType === ChangeType.Deleted || change.changeType === ChangeType.Added) {
          isPure = false;
        } else if (change.changeType === ChangeType.Modified && change.previousSignature !== change.newSignature) {
          isPure = false; // Signature change breaks pure refactor definition
        }
      }
    }

    if (affectedFiles.size > 0) {
      refactors.push({
        description: `Refactored logic in ${affectedFiles.size} file(s)`,
        filesInvolved: Array.from(affectedFiles),
        isPure
      });
    }

    return refactors;
  }
}
