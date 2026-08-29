import { IDependency } from '../models/Dependency';

export class DependencyVersionManager {
  public isModified(oldHash: string, newHash: string): boolean {
    return oldHash !== newHash;
  }
}
