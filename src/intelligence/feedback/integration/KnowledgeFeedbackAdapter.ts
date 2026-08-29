import { ChangeSet } from '../models/ChangeSet';

export class KnowledgeFeedbackAdapter {
  public applyUpdates(changes: ChangeSet): Array<{ target: string; operation: string }> {
    const updates: Array<{ target: string; operation: string }> = [];

    for (const record of changes.records) {
      updates.push({
        target: record.resourceId,
        operation: `SYNC_${record.operation}`
      });
    }

    return updates;
  }
}
