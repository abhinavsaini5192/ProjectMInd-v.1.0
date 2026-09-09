import type { DIContainer } from '../../../../workspace/di/DIContainer.js';
import { FeatureHealthAPI } from '../api/FeatureHealthAPI.js';
import { FeatureHealthAnalyzer } from '../core/FeatureHealthAnalyzer.js';
import { FeatureHealthCoordinator } from '../core/FeatureHealthCoordinator.js';
import { FeatureHealthEngine } from '../core/FeatureHealthEngine.js';
import { FeatureHealthExplainer } from '../core/FeatureHealthExplainer.js';
import { FeatureHealthScorer } from '../core/FeatureHealthScorer.js';
import { FeatureRiskDetector } from '../core/FeatureRiskDetector.js';
import { FeatureHealthRepository } from '../repository/FeatureHealthRepository.js';

export const FeatureHealthTokens = {
  Repository: Symbol('FeatureHealthRepository'),
  Scorer: Symbol('FeatureHealthScorer'),
  RiskDetector: Symbol('FeatureRiskDetector'),
  Coordinator: Symbol('FeatureHealthCoordinator'),
  Analyzer: Symbol('FeatureHealthAnalyzer'),
  Explainer: Symbol('FeatureHealthExplainer'),
  Engine: Symbol('FeatureHealthEngine'),
  API: Symbol('FeatureHealthAPI'),
};

export function registerFeatureHealthServices(
  container: DIContainer,
  repositoryInstance?: FeatureHealthRepository
): void {
  const repo = repositoryInstance || new FeatureHealthRepository();

  container.registerFactory(FeatureHealthTokens.Repository, () => repo, 'Singleton');
  container.registerFactory(FeatureHealthTokens.Scorer, () => new FeatureHealthScorer(), 'Singleton');
  container.registerFactory(FeatureHealthTokens.RiskDetector, () => new FeatureRiskDetector(), 'Singleton');
  container.registerFactory(FeatureHealthTokens.Coordinator, () => new FeatureHealthCoordinator(), 'Singleton');
  container.registerFactory(
    FeatureHealthTokens.Analyzer,
    (c) =>
      new FeatureHealthAnalyzer({
        scorer: c.resolve(FeatureHealthTokens.Scorer),
        riskDetector: c.resolve(FeatureHealthTokens.RiskDetector),
      }),
    'Singleton'
  );
  container.registerFactory(FeatureHealthTokens.Explainer, () => new FeatureHealthExplainer(), 'Singleton');

  container.registerFactory(
    FeatureHealthTokens.Engine,
    (c) =>
      new FeatureHealthEngine(c.resolve(FeatureHealthTokens.Repository), {
        coordinator: c.resolve(FeatureHealthTokens.Coordinator),
        analyzer: c.resolve(FeatureHealthTokens.Analyzer),
        explainer: c.resolve(FeatureHealthTokens.Explainer),
      }),
    'Singleton'
  );

  container.registerFactory(
    FeatureHealthTokens.API,
    (c) =>
      new FeatureHealthAPI(
        c.resolve(FeatureHealthTokens.Engine),
        c.resolve(FeatureHealthTokens.Repository)
      ),
    'Singleton'
  );
}
