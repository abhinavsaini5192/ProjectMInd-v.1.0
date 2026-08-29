import { ChangeSet } from '../models/ChangeSet';

export class PatchPreview {
  public formatForHuman(changeSet: ChangeSet): string {
    return `
=========================================
📝 PATCH PREVIEW
=========================================
File: ${changeSet.file}
Operation: ${changeSet.operation}
Target: ${changeSet.targetSymbol || 'Whole File'}
Impact: ${changeSet.impact.impact}

Diff:
${changeSet.patch}
=========================================
    `.trim();
  }
}
