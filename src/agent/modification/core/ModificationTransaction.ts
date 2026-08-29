import { ModificationIntent } from '../models/ModificationIntent';
import { ChangeSet } from '../models/ChangeSet';
import { ContextResolver } from './ContextResolver';
import { ChangeGenerator } from '../patch/ChangeGenerator';
import { PatchValidator } from '../patch/PatchValidator';
import { PatchGenerator } from '../patch/PatchGenerator';
import { RollbackManager } from '../safety/RollbackManager';
import * as fs from 'fs';

export class ModificationTransaction {
  private changeId: string;
  private changeSet?: ChangeSet;

  constructor(
    private intent: ModificationIntent,
    private resolver: ContextResolver,
    private generator: ChangeGenerator,
    private validator: PatchValidator,
    private patchGen: PatchGenerator,
    private rollbackManager: RollbackManager,
    private actionId: string
  ) {
    this.changeId = `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public async begin(): Promise<ChangeSet> {
    // 1. Resolve Target
    const resolved = this.resolver.resolveTarget(this.intent);
    if (!fs.existsSync(resolved.absolutePath)) {
      throw new Error(`Target file not found: ${resolved.absolutePath}`);
    }

    // 2. Snapshot
    this.rollbackManager.createSnapshot(this.changeId, resolved.absolutePath);

    // 3. Generate
    const originalContent = fs.readFileSync(resolved.absolutePath, 'utf8');
    const patchedContent = this.generator.generateChange(this.intent, originalContent);

    // 4. Validate
    this.validator.validate(patchedContent);

    // 5. Create ChangeSet
    const beforeHash = this.patchGen.hashContent(originalContent);
    const afterHash = this.patchGen.hashContent(patchedContent);
    
    // Check Expected State (Optimistic Concurrency)
    if (this.intent.expectedState && beforeHash !== this.intent.expectedState) {
       throw new Error(`CONFLICT: Expected file state does not match current state.`);
    }

    this.changeSet = {
      changeId: this.changeId,
      actionId: this.actionId,
      file: resolved.absolutePath,
      operation: this.intent.operation,
      targetSymbol: this.intent.symbol,
      beforeHash,
      afterHash,
      patch: this.patchGen.generateUnifiedDiff(originalContent, patchedContent, resolved.absolutePath),
      impact: {
        impact: this.intent.impactLevel || 'LOW',
        affectedSymbols: this.intent.symbol ? [this.intent.symbol] : [],
        publicApiChanged: false,
        downstreamDependenciesAffected: 0
      }
    };

    return this.changeSet;
  }

  public getChangeSet(): ChangeSet {
    if (!this.changeSet) throw new Error('Transaction not begun');
    return this.changeSet;
  }

  public rollback(): void {
    this.rollbackManager.rollback(this.changeId);
  }
}
