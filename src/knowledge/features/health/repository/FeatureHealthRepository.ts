import type { IFeatureHealthRepository, HealthQueryFilter } from '../interfaces/IFeatureHealthRepository.js';
import type { FeatureHealth } from '../models/FeatureHealth.js';

export class FeatureHealthRepository implements IFeatureHealthRepository {
  private healthsById = new Map<string, FeatureHealth>();
  private healthsByFeatureId = new Map<string, FeatureHealth>();

  public async save(health: FeatureHealth): Promise<void> {
    const clone: FeatureHealth = JSON.parse(JSON.stringify(health));
    this.healthsById.set(clone.healthId, clone);
    this.healthsByFeatureId.set(clone.featureId, clone);
  }

  public async saveBatch(healths: FeatureHealth[]): Promise<void> {
    for (const h of healths) {
      await this.save(h);
    }
  }

  public async getById(healthId: string): Promise<FeatureHealth | null> {
    const found = this.healthsById.get(healthId);
    return found ? JSON.parse(JSON.stringify(found)) : null;
  }

  public async getByFeatureId(featureId: string): Promise<FeatureHealth | null> {
    const found = this.healthsByFeatureId.get(featureId);
    return found ? JSON.parse(JSON.stringify(found)) : null;
  }

  public async getAll(filter?: HealthQueryFilter): Promise<FeatureHealth[]> {
    let list = Array.from(this.healthsByFeatureId.values());

    if (filter) {
      if (filter.status) {
        list = list.filter((h) => h.healthScore.status === filter.status);
      }
      if (typeof filter.minHealthScore === 'number') {
        list = list.filter((h) => h.healthScore.overallScore >= filter.minHealthScore!);
      }
      if (typeof filter.maxHealthScore === 'number') {
        list = list.filter((h) => h.healthScore.overallScore <= filter.maxHealthScore!);
      }
      if (typeof filter.minRiskScore === 'number') {
        list = list.filter((h) => h.riskAssessment.overallRiskScore >= filter.minRiskScore!);
      }
      if (filter.highestRiskSeverity) {
        list = list.filter((h) => h.riskAssessment.highestRiskSeverity === filter.highestRiskSeverity);
      }
      if (typeof filter.isStale === 'boolean') {
        list = list.filter((h) => h.isStale === filter.isStale);
      }
    }

    return list.map((h) => JSON.parse(JSON.stringify(h)));
  }

  public async delete(healthId: string): Promise<boolean> {
    const found = this.healthsById.get(healthId);
    if (!found) return false;

    this.healthsById.delete(healthId);
    this.healthsByFeatureId.delete(found.featureId);
    return true;
  }

  public async markStale(featureIds: string[]): Promise<void> {
    for (const fId of featureIds) {
      const existing = this.healthsByFeatureId.get(fId);
      if (existing) {
        existing.isStale = true;
        existing.updatedAt = Date.now();
        this.healthsById.set(existing.healthId, existing);
      }
    }
  }

  public async clear(): Promise<void> {
    this.healthsById.clear();
    this.healthsByFeatureId.clear();
  }
}
