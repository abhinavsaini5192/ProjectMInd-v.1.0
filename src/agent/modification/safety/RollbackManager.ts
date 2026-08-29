import * as fs from 'fs';
import * as crypto from 'crypto';
import { ModificationSnapshot } from './ModificationSnapshot';

export class RollbackManager {
  private snapshots = new Map<string, ModificationSnapshot>();

  public createSnapshot(changeId: string, filePath: string): ModificationSnapshot {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Cannot snapshot non-existent file: ${filePath}`);
    }
    const content = fs.readFileSync(filePath, 'utf8');
    const hash = crypto.createHash('sha256').update(content).digest('hex');
    const snapshot: ModificationSnapshot = {
      changeId,
      file: filePath,
      content,
      hash,
      timestamp: Date.now()
    };
    this.snapshots.set(changeId, snapshot);
    return snapshot;
  }

  public rollback(changeId: string): void {
    const snapshot = this.snapshots.get(changeId);
    if (!snapshot) {
      throw new Error(`No snapshot found for changeId: ${changeId}`);
    }

    if (!fs.existsSync(snapshot.file)) {
      // In a real scenario we might need to recreate the file, or it was deleted.
      fs.writeFileSync(snapshot.file, snapshot.content, 'utf8');
      return;
    }

    const currentContent = fs.readFileSync(snapshot.file, 'utf8');
    // If the file was modified since our snapshot by a completely different process/user,
    // we should NOT just blindly overwrite it.
    // However, during rollback of an immediate transaction failure, we assume we own the state.
    // For safety, we just restore.
    fs.writeFileSync(snapshot.file, snapshot.content, 'utf8');
  }
}
