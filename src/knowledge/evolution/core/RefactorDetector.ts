import { CommitSnapshot } from '../models/CommitSnapshot';
import { Refactor } from '../models/Refactor';
import { RefactorType } from '../types/EvolutionTypes';
import crypto from 'crypto';

export class RefactorDetector {
  /**
   * Detects semantic refactors by analyzing added/removed/modified symbols.
   */
  public detect(snapshot: CommitSnapshot): Refactor[] {
    const refactors: Refactor[] = [];

    // Simple heuristic: if 1 symbol is removed and 1 symbol is added in the same commit, 
    // and we had AST structural similarity (mocked here), we infer a Rename.
    if (snapshot.removedSymbolIds.length === 1 && snapshot.addedSymbolIds.length === 1) {
       refactors.push({
         id: crypto.createHash('sha256').update(snapshot.commitHash + 'rename').digest('hex'),
         commitHash: snapshot.commitHash,
         type: RefactorType.Rename,
         sourceSymbolIds: [snapshot.removedSymbolIds[0]],
         targetSymbolIds: [snapshot.addedSymbolIds[0]],
         description: `Inferred rename/move from ${snapshot.removedSymbolIds[0]} to ${snapshot.addedSymbolIds[0]}`
       });
    }

    // Extract Method heuristic: 1 symbol modified (sheds logic), 1 or more added
    if (snapshot.modifiedSymbolIds.length === 1 && snapshot.addedSymbolIds.length > 0 && snapshot.removedSymbolIds.length === 0) {
       refactors.push({
         id: crypto.createHash('sha256').update(snapshot.commitHash + 'extract').digest('hex'),
         commitHash: snapshot.commitHash,
         type: RefactorType.ExtractMethod,
         sourceSymbolIds: [snapshot.modifiedSymbolIds[0]],
         targetSymbolIds: [...snapshot.addedSymbolIds],
         description: `Inferred extraction from ${snapshot.modifiedSymbolIds[0]}`
       });
    }

    return refactors;
  }
}
