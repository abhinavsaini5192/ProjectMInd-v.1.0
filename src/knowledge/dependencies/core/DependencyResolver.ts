import { IDependency } from '../models/Dependency';
import { DependencyRegistry } from './DependencyRegistry';

export class DependencyResolver {
  constructor(private registry: DependencyRegistry) {}

  public resolveById(id: string): IDependency | undefined {
    return this.registry.getDependency(id);
  }

  public findDependencies(symbolId: string): IDependency[] {
    return this.registry.getOutEdges(symbolId).map(id => this.registry.getDependency(id)!);
  }

  public findDependents(symbolId: string): IDependency[] {
    return this.registry.getInEdges(symbolId).map(id => this.registry.getDependency(id)!);
  }
}
