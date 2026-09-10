import type { IImpactRepository, ImpactQueryFilters } from '../interfaces/IImpactRepository.js';
import type { ImpactResult } from '../models/ImpactResult.js';
import type { FeatureImpact } from '../models/FeatureImpact.js';
import type { ResourceImpact } from '../models/ResourceImpact.js';
import type { ImpactPath } from '../models/ImpactPath.js';
import type { ImpactConflict } from '../models/ImpactConflict.js';

export class FeatureImpactRepository implements IImpactRepository {
  private results = new Map<string, ImpactResult>();
  private featureImpacts = new Map<string, FeatureImpact>();
  private resourceImpacts = new Map<string, ResourceImpact>();
  private paths = new Map<string, ImpactPath>();
  private conflicts = new Map<string, ImpactConflict>();

  public async saveResult(result: ImpactResult): Promise<void> {
    this.results.set(result.runId, result);

    for (const f of result.featureImpacts) {
      this.featureImpacts.set(f.impactId, f);
    }

    for (const r of result.resourceImpacts) {
      this.resourceImpacts.set(r.impactId, r);
    }

    for (const p of result.impactPaths) {
      this.paths.set(p.pathId, p);
    }

    for (const c of result.conflicts) {
      this.conflicts.set(c.conflictId, c);
    }
  }

  public async getResult(runId: string): Promise<ImpactResult | null> {
    return this.results.get(runId) || null;
  }

  public async getLatestResult(repositoryId: string): Promise<ImpactResult | null> {
    const matching = Array.from(this.results.values()).filter((r) => r.repositoryId === repositoryId);
    if (matching.length === 0) return null;
    return matching.sort((a, b) => b.completedAt - a.completedAt)[0] || null;
  }

  public async getFeatureImpacts(featureId: string, activeOnly: boolean = true): Promise<FeatureImpact[]> {
    return Array.from(this.featureImpacts.values()).filter(
      (f) => f.targetFeatureId === featureId && (!activeOnly || f.active)
    );
  }

  public async getResourceImpacts(resourceId: string, activeOnly: boolean = true): Promise<ResourceImpact[]> {
    return Array.from(this.resourceImpacts.values()).filter(
      (r) => r.affectedResourceId === resourceId && (!activeOnly || r.active)
    );
  }

  public async getAllFeatureImpacts(filters?: ImpactQueryFilters): Promise<FeatureImpact[]> {
    let list = Array.from(this.featureImpacts.values());

    if (filters?.activeOnly !== false) {
      list = list.filter((f) => f.active);
    }
    if (filters?.featureId) {
      list = list.filter((f) => f.targetFeatureId === filters.featureId);
    }
    if (filters?.impactType) {
      list = list.filter((f) => f.impactType === filters.impactType);
    }
    if (filters?.minScore !== undefined) {
      list = list.filter((f) => f.score >= filters.minScore!);
    }

    return list;
  }

  public async getAllResourceImpacts(filters?: ImpactQueryFilters): Promise<ResourceImpact[]> {
    let list = Array.from(this.resourceImpacts.values());

    if (filters?.activeOnly !== false) {
      list = list.filter((r) => r.active);
    }
    if (filters?.resourceId) {
      list = list.filter((r) => r.affectedResourceId === filters.resourceId);
    }
    if (filters?.impactType) {
      list = list.filter((r) => r.impactType === filters.impactType);
    }
    if (filters?.minScore !== undefined) {
      list = list.filter((r) => r.score >= filters.minScore!);
    }

    return list;
  }

  public async getImpactPath(pathId: string): Promise<ImpactPath | null> {
    return this.paths.get(pathId) || null;
  }

  public async findImpactPaths(sourceId: string, targetId: string): Promise<ImpactPath[]> {
    return Array.from(this.paths.values()).filter(
      (p) =>
        (p.sourceNode.featureId === sourceId || p.sourceNode.resourceId === sourceId) &&
        (p.targetNode.featureId === targetId || p.targetNode.resourceId === targetId)
    );
  }

  public async getConflicts(runId?: string): Promise<ImpactConflict[]> {
    if (runId) {
      const run = this.results.get(runId);
      return run ? run.conflicts : [];
    }
    return Array.from(this.conflicts.values());
  }

  public async markStale(impactIds: string[], reason: string): Promise<void> {
    for (const id of impactIds) {
      const feat = this.featureImpacts.get(id);
      if (feat) {
        feat.active = false;
        feat.metadata = { ...(feat.metadata || {}), deactivationReason: reason, staleAt: Date.now() };
      }
      const res = this.resourceImpacts.get(id);
      if (res) {
        res.active = false;
        res.metadata = { ...(res.metadata || {}), deactivationReason: reason, staleAt: Date.now() };
      }
    }
  }

  public async invalidateByFeature(featureId: string, reason: string): Promise<void> {
    for (const f of this.featureImpacts.values()) {
      if (f.targetFeatureId === featureId && f.active) {
        f.active = false;
        f.metadata = { ...(f.metadata || {}), deactivationReason: reason, staleAt: Date.now() };
      }
    }
  }

  public async clear(): Promise<void> {
    this.results.clear();
    this.featureImpacts.clear();
    this.resourceImpacts.clear();
    this.paths.clear();
    this.conflicts.clear();
  }
}
