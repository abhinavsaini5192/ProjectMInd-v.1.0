import { RepositoryChange, ChangeType } from '../models/RepositoryChange';

export class DiffEngine {
  /**
   * Translates a raw git diff into structured RepositoryChange objects.
   * This is a heuristic engine.
   */
  public parseDiff(rawDiff: string): RepositoryChange[] {
    const changes: RepositoryChange[] = [];
    const lines = rawDiff.split('\n');
    
    let currentPath = '';
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('diff --git')) {
        const parts = line.split(' ');
        const aPath = parts[2].replace('a/', '');
        const bPath = parts[3].replace('b/', '');
        currentPath = bPath;
        
        let changeType = ChangeType.Modified;
        // Look ahead for file status
        if (lines[i+1]?.startsWith('new file mode')) {
          changeType = ChangeType.Added;
        } else if (lines[i+1]?.startsWith('deleted file mode')) {
          changeType = ChangeType.Deleted;
        } else if (lines[i+1]?.startsWith('similarity index') && lines[i+2]?.startsWith('rename from')) {
          changeType = ChangeType.Renamed;
        }

        changes.push({
          changeType,
          path: currentPath,
          oldPath: changeType === ChangeType.Renamed ? aPath : undefined
        });
      }
    }
    
    return changes;
  }
}
