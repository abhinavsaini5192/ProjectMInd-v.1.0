export class UnsafeRepairBlockedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnsafeRepairBlockedError';
  }
}

export class RepairManager {
  public executeSafeRepair(repairAction: string): boolean {
    if (repairAction === 'flush_cache' || repairAction === 'rebuild_index') {
       return true;
    }
    
    // Explicitly block unsafe destructive actions
    if (repairAction === 'delete_symbol' || repairAction === 'merge_feature' || repairAction === 'mutate_source') {
       throw new UnsafeRepairBlockedError(`Action ${repairAction} is a destructive semantic repair and requires explicit authorization.`);
    }

    return false;
  }
}
