import type { HealthContext } from './IFeatureHealthSignal.js';

export interface HealthContextOptions {
  includeIndirectDependencies?: boolean;
  includeFlows?: boolean;
}

export interface IFeatureHealthCoordinator {
  buildContext(featureId: string, options?: HealthContextOptions): Promise<HealthContext>;
  buildAllContexts(workspaceId: string, repositoryId: string): Promise<HealthContext[]>;
}
