import type { DIContainer } from '../../../../workspace/di/DIContainer';
import { FeatureMappingEngine } from '../core/FeatureMappingEngine';
import { FeatureMappingCoordinator } from '../core/FeatureMappingCoordinator';
import { FeatureMappingRepository } from '../repository/FeatureMappingRepository';
import { FeatureMappingAPI } from '../api/FeatureMappingAPI';

export const FeatureMappingTokens = {
  Coordinator: Symbol('FeatureMappingCoordinator'),
  Repository: Symbol('FeatureMappingRepository'),
  Engine: Symbol('FeatureMappingEngine'),
  API: Symbol('FeatureMappingAPI'),
};

export function registerFeatureMappingServices(
  container: DIContainer,
  registryInstance: any,
  repositoryInstance?: FeatureMappingRepository
): void {
  const repo = repositoryInstance || new FeatureMappingRepository();
  container.registerFactory(FeatureMappingTokens.Repository, () => repo, 'Singleton');

  container.registerFactory(FeatureMappingTokens.Coordinator, () => new FeatureMappingCoordinator(), 'Singleton');
  container.registerFactory(
    FeatureMappingTokens.Engine,
    (c) =>
      new FeatureMappingEngine(
        registryInstance,
        c.resolve(FeatureMappingTokens.Repository),
        c.resolve(FeatureMappingTokens.Coordinator)
      ),
    'Singleton'
  );
  container.registerFactory(
    FeatureMappingTokens.API,
    (c) => new FeatureMappingAPI(c.resolve(FeatureMappingTokens.Engine)),
    'Singleton'
  );
}
