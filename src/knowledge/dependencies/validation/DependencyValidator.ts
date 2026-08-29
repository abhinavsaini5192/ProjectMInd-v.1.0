import { IDependency } from '../models/Dependency';

export class DependencyValidator {
  public validate(deps: IDependency[]): boolean {
    const ids = new Set<string>();

    for (const dep of deps) {
      if (ids.has(dep.id)) {
        throw new Error(`Duplicate Dependency ID detected: ${dep.id}`);
      }
      ids.add(dep.id);

      if (dep.sourceId === dep.targetId) {
        throw new Error(`Self-referencing dependency not allowed for symbol: ${dep.sourceId}`);
      }
    }

    return true;
  }
}
