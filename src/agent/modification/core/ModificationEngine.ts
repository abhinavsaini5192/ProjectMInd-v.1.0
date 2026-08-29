import { ModificationIntent } from '../models/ModificationIntent';
import { ChangeSet } from '../models/ChangeSet';
import { ModificationTransaction } from './ModificationTransaction';
import { ContextResolver } from './ContextResolver';
import { ChangeGenerator } from '../patch/ChangeGenerator';
import { PatchValidator } from '../patch/PatchValidator';
import { PatchGenerator } from '../patch/PatchGenerator';
import { RollbackManager } from '../safety/RollbackManager';
import { KernelEventDispatcher } from '../../../kernel/core/KernelEventDispatcher';

export class ModificationEngine {
  private resolver = new ContextResolver();
  private generator = new ChangeGenerator();
  private validator = new PatchValidator();
  private patchGen = new PatchGenerator();
  private rollbackManager = new RollbackManager();

  constructor(private dispatcher: KernelEventDispatcher) {}

  public async prepareModification(intent: ModificationIntent, actionId: string): Promise<ModificationTransaction> {
    this.dispatcher.publish('MODIFICATION_STARTED', { actionId });
    
    const transaction = new ModificationTransaction(
      intent,
      this.resolver,
      this.generator,
      this.validator,
      this.patchGen,
      this.rollbackManager,
      actionId
    );

    try {
      await transaction.begin();
      this.dispatcher.publish('PATCH_VALIDATED', { actionId });
      return transaction;
    } catch (error: any) {
      this.dispatcher.publish('MODIFICATION_FAILED', { actionId, error: error.message });
      throw error;
    }
  }

  public executeTransaction(transaction: ModificationTransaction, executeCallback: (changeSet: ChangeSet) => void): void {
    const changeSet = transaction.getChangeSet();
    try {
      executeCallback(changeSet);
      this.dispatcher.publish('MODIFICATION_APPLIED', { actionId: changeSet.actionId });
    } catch (error: any) {
      transaction.rollback();
      this.dispatcher.publish('MODIFICATION_ROLLED_BACK', { actionId: changeSet.actionId });
      throw new Error(`Execution failed, rolled back: ${error.message}`);
    }
  }
}
