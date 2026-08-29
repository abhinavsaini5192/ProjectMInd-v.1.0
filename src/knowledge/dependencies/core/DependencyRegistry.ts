import { IDependency } from '../models/Dependency';
import { DependencyChain } from '../models/DependencyChain';

export class DependencyRegistry {
  private deps: Map<string, IDependency> = new Map();
  private chains: Map<string, DependencyChain> = new Map();

  private outEdges: Map<string, string[]> = new Map();
  private inEdges: Map<string, string[]> = new Map();

  public registerDependency(dep: IDependency): void {
    this.deps.set(dep.id, dep);

    if (!this.outEdges.has(dep.sourceId)) this.outEdges.set(dep.sourceId, []);
    const out = this.outEdges.get(dep.sourceId)!;
    if (!out.includes(dep.id)) out.push(dep.id);

    if (!this.inEdges.has(dep.targetId)) this.inEdges.set(dep.targetId, []);
    const inE = this.inEdges.get(dep.targetId)!;
    if (!inE.includes(dep.id)) inE.push(dep.id);
  }

  public registerChain(chain: DependencyChain): void {
    this.chains.set(chain.id, chain);
  }

  public getDependency(id: string): IDependency | undefined {
    return this.deps.get(id);
  }

  public getOutEdges(sourceId: string): string[] {
    return this.outEdges.get(sourceId) || [];
  }

  public getInEdges(targetId: string): string[] {
    return this.inEdges.get(targetId) || [];
  }
  
  public getAllDependencies(): IDependency[] {
    return Array.from(this.deps.values());
  }

  public clear(): void {
    this.deps.clear();
    this.chains.clear();
    this.outEdges.clear();
    this.inEdges.clear();
  }
}
