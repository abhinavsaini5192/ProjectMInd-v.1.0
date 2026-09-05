import type { ActionPlan } from '../../planning/models/ActionPlan';
import { PlanFreshnessError } from '../errors/PlanFreshnessError';

export interface ResourceState {
  uri: string;
  hash?: string;
  lastModified?: number;
}

export interface FreshnessCheckResult {
  fresh: boolean;
  staleResources: string[];
  reasons: string[];
}

export interface ResourceStateResolver {
  getResourceState(uri: string): Promise<ResourceState | null> | ResourceState | null;
}

export class PlanFreshnessValidator {
  private snapshots: Map<string, Map<string, ResourceState>> = new Map();

  constructor(private readonly resolver?: ResourceStateResolver) {}

  /**
   * Capture snapshot of resources for a given plan at formulation time
   */
  public captureSnapshot(planId: string, resources: ResourceState[]): void {
    const resourceMap = new Map<string, ResourceState>();
    for (const r of resources) {
      resourceMap.set(r.uri, { ...r });
    }
    this.snapshots.set(planId, resourceMap);
  }

  /**
   * Validate that the resources affected by the plan have not changed since snapshot or plan creation
   */
  public async validateFreshness(
    plan: ActionPlan,
    currentStates?: ResourceState[],
    strict: boolean = false
  ): Promise<FreshnessCheckResult> {
    const staleResources: string[] = [];
    const reasons: string[] = [];

    const snapshot = this.snapshots.get(plan.planId);
    const targetUris = new Set<string>([
      ...plan.affectedResources,
      ...plan.steps
        .map((s) => s.target?.id || (s as any).targetResource)
        .filter(Boolean) as string[],
    ]);

    // Build current state lookup
    const currentStateMap = new Map<string, ResourceState>();
    if (currentStates) {
      for (const s of currentStates) {
        currentStateMap.set(s.uri, s);
      }
    }

    for (const uri of targetUris) {
      let current: ResourceState | null | undefined = currentStateMap.get(uri);
      if (!current && this.resolver) {
        current = await this.resolver.getResourceState(uri);
      }

      if (snapshot && snapshot.has(uri)) {
        const baseline = snapshot.get(uri)!;
        if (current) {
          if (baseline.hash && current.hash && baseline.hash !== current.hash) {
            staleResources.push(uri);
            reasons.push(`Resource content hash mismatch for ${uri} (planned: ${baseline.hash}, current: ${current.hash})`);
          } else if (baseline.lastModified && current.lastModified && current.lastModified > baseline.lastModified) {
            staleResources.push(uri);
            reasons.push(`Resource ${uri} was modified after plan creation (planned: ${baseline.lastModified}, current: ${current.lastModified})`);
          }
        }
      } else if (current && current.lastModified && current.lastModified > plan.createdAt) {
        staleResources.push(uri);
        reasons.push(`Resource ${uri} was modified after plan was created (createdAt: ${plan.createdAt}, modified: ${current.lastModified})`);
      }
    }

    const fresh = staleResources.length === 0;

    if (!fresh && strict) {
      throw new PlanFreshnessError(
        `Plan ${plan.planId} is stale. Resources changed since plan generation.`,
        staleResources,
        { reasons }
      );
    }

    return {
      fresh,
      staleResources,
      reasons,
    };
  }

  public clearSnapshot(planId: string): void {
    this.snapshots.delete(planId);
  }
}
