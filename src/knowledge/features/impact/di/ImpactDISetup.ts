import type { DIContainer } from '../../../../workspace/di/DIContainer.js';
import { FeatureImpactRepository } from '../repository/FeatureImpactRepository.js';
import { FeatureImpactCoordinator } from '../core/FeatureImpactCoordinator.js';
import { FeatureImpactAnalyzer } from '../core/FeatureImpactAnalyzer.js';
import { ImpactExplainer } from '../core/ImpactExplainer.js';
import { FeatureImpactEngine } from '../core/FeatureImpactEngine.js';
import { FeatureImpactAPI } from '../api/FeatureImpactAPI.js';

export const FeatureImpactTokens = {
  Repository: Symbol('FeatureImpactRepository'),
  Coordinator: Symbol('FeatureImpactCoordinator'),
  Analyzer: Symbol('FeatureImpactAnalyzer'),
  Explainer: Symbol('ImpactExplainer'),
  Engine: Symbol('FeatureImpactEngine'),
  API: Symbol('FeatureImpactAPI'),
};

export function registerFeatureImpactServices(
  container: DIContainer,
  repositoryInstance?: FeatureImpactRepository
): void {
  const repo = repositoryInstance || new FeatureImpactRepository();

  container.registerFactory(FeatureImpactTokens.Repository, () => repo, 'Singleton');
  container.registerFactory(FeatureImpactTokens.Coordinator, () => new FeatureImpactCoordinator(), 'Singleton');
  container.registerFactory(FeatureImpactTokens.Analyzer, () => new FeatureImpactAnalyzer(), 'Singleton');
  container.registerFactory(FeatureImpactTokens.Explainer, () => new ImpactExplainer(), 'Singleton');

  container.registerFactory(
    FeatureImpactTokens.Engine,
    (c) =>
      new FeatureImpactEngine(c.resolve(FeatureImpactTokens.Repository), {
        coordinator: c.resolve(FeatureImpactTokens.Coordinator),
        analyzer: c.resolve(FeatureImpactTokens.Analyzer),
        explainer: c.resolve(FeatureImpactTokens.Explainer),
      }),
    'Singleton'
  );

  container.registerFactory(
    FeatureImpactTokens.API,
    (c) =>
      new FeatureImpactAPI(
        c.resolve(FeatureImpactTokens.Engine),
        c.resolve(FeatureImpactTokens.Repository)
      ),
    'Singleton'
  );
}
