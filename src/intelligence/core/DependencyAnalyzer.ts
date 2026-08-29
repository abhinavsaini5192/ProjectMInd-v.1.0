import { DependencyChange } from '../models/SpecificChanges';

export class DependencyAnalyzer {
  /**
   * Compares two package.json or dependency manifests.
   * Format of inputs is record of Dependency -> Version string.
   */
  public analyze(oldDeps: Record<string, string>, newDeps: Record<string, string>): DependencyChange[] {
    const changes: DependencyChange[] = [];
    
    for (const [dep, newVer] of Object.entries(newDeps)) {
      const oldVer = oldDeps[dep];
      if (!oldVer) {
        changes.push({
          dependencyName: dep,
          newVersion: newVer,
          isAdded: true,
          isRemoved: false
        });
      } else if (oldVer !== newVer) {
        changes.push({
          dependencyName: dep,
          oldVersion: oldVer,
          newVersion: newVer,
          isAdded: false,
          isRemoved: false
        });
      }
    }

    for (const [dep, oldVer] of Object.entries(oldDeps)) {
      if (!newDeps[dep]) {
        changes.push({
          dependencyName: dep,
          oldVersion: oldVer,
          isAdded: false,
          isRemoved: true
        });
      }
    }

    return changes;
  }
}
