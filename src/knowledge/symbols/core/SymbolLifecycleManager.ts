import { Symbol } from '../models/Symbol';
import { SymbolVersionManager } from './SymbolVersionManager';
import { KernelEventDispatcher } from '../../../kernel/core/KernelEventDispatcher';

// Create ad-hoc event names since we shouldn't modify KernelEvents if possible,
// but for an architectural system, we might extend it. We will use string constants here.
export const SYMBOL_CREATED = 'Symbol:Created';
export const SYMBOL_UPDATED = 'Symbol:Updated';
export const SYMBOL_REMOVED = 'Symbol:Removed';

export class SymbolLifecycleManager {
  constructor(
    private versionManager: SymbolVersionManager,
    private dispatcher: KernelEventDispatcher
  ) {}

  public processEvolution(existingSymbol: Symbol | undefined, newSymbol: Symbol): Symbol {
    if (!existingSymbol) {
      this.dispatcher.publish(SYMBOL_CREATED, { id: newSymbol.id });
      return newSymbol;
    }

    if (this.versionManager.isModified(existingSymbol.hash, newSymbol.hash)) {
      existingSymbol.hash = newSymbol.hash;
      existingSymbol.version += 1;
      existingSymbol.updated = Date.now();
      existingSymbol.location = newSymbol.location;
      existingSymbol.documentation = newSymbol.documentation;
      existingSymbol.history.push(`Updated to version ${existingSymbol.version}`);
      
      this.dispatcher.publish(SYMBOL_UPDATED, { id: existingSymbol.id, version: existingSymbol.version });
    }

    return existingSymbol;
  }
}
