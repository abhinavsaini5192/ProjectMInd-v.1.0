import type { DIContainer } from '../../../../workspace/di/DIContainer';
import { FeatureDiscoveryEngine } from '../core/FeatureDiscoveryEngine';
import { FeatureDiscoveryCoordinator } from '../core/FeatureDiscoveryCoordinator';
import { FeatureDiscoveryAPI } from '../api/FeatureDiscoveryAPI';

export const FeatureDiscoveryTokens = {
  Coordinator: Symbol('FeatureDiscoveryCoordinator'),
  Engine: Symbol('FeatureDiscoveryEngine'),
  API: Symbol('FeatureDiscoveryAPI'),
};

export function registerFeatureDiscoveryServices(container: DIContainer, registryInstance: any): void {
  container.registerFactory(FeatureDiscoveryTokens.Coordinator, () => new FeatureDiscoveryCoordinator(), 'Singleton');
  container.registerFactory(
    FeatureDiscoveryTokens.Engine,
    (c) => new FeatureDiscoveryEngine(registryInstance, c.resolve(FeatureDiscoveryTokens.Coordinator)),
    'Singleton'
  );
  container.registerFactory(
    FeatureDiscoveryTokens.API,
    (c) => new FeatureDiscoveryAPI(c.resolve(FeatureDiscoveryTokens.Engine)),
    'Singleton'
  );
}
