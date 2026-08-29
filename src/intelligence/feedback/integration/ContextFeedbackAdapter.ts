import { ChangeSet } from '../models/ChangeSet';

export class ContextFeedbackAdapter {
  public determineInvalidations(changes: ChangeSet): string[] {
    const invalidatedScopes: Set<string> = new Set();

    for (const record of changes.records) {
      invalidatedScopes.add(record.resourceId);
      if (record.resourceType === 'SYMBOL') {
        invalidatedScopes.add('symbols_context');
      }
      if (record.resourceType === 'DEPENDENCY') {
        invalidatedScopes.add('dependencies_context');
      }
      if (record.resourceType === 'ARCHITECTURE') {
        invalidatedScopes.add('architecture_context');
      }
    }

    return Array.from(invalidatedScopes);
  }
}
