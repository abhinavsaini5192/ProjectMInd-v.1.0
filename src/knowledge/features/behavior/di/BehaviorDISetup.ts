import type { DIContainer } from '../../../../workspace/di/DIContainer';
import { FeatureBehaviorAPI } from '../api/FeatureBehaviorAPI';
import { FeatureBehaviorAnalyzer } from '../core/FeatureBehaviorAnalyzer';
import { FeatureBehaviorEngine } from '../core/FeatureBehaviorEngine';
import { FeatureBehaviorExplainer } from '../core/FeatureBehaviorExplainer';
import { FeatureBehaviorNormalizer } from '../core/FeatureBehaviorNormalizer';
import { FeatureBehaviorValidator } from '../core/FeatureBehaviorValidator';
import { FeatureFlowBuilder } from '../core/FeatureFlowBuilder';
import { FeatureFlowResolver } from '../core/FeatureFlowResolver';
import { FeatureBehaviorRepository } from '../repository/FeatureBehaviorRepository';

export const FeatureBehaviorTokens = {
  Repository: Symbol('FeatureBehaviorRepository'),
  FlowBuilder: Symbol('FeatureFlowBuilder'),
  Normalizer: Symbol('FeatureBehaviorNormalizer'),
  Validator: Symbol('FeatureBehaviorValidator'),
  Resolver: Symbol('FeatureFlowResolver'),
  Analyzer: Symbol('FeatureBehaviorAnalyzer'),
  Explainer: Symbol('FeatureBehaviorExplainer'),
  Engine: Symbol('FeatureBehaviorEngine'),
  API: Symbol('FeatureBehaviorAPI'),
};

export function registerFeatureBehaviorServices(
  container: DIContainer,
  repositoryInstance?: FeatureBehaviorRepository
): void {
  const repo = repositoryInstance || new FeatureBehaviorRepository();

  container.registerFactory(FeatureBehaviorTokens.Repository, () => repo, 'Singleton');
  container.registerFactory(FeatureBehaviorTokens.FlowBuilder, () => new FeatureFlowBuilder(), 'Singleton');
  container.registerFactory(FeatureBehaviorTokens.Normalizer, () => new FeatureBehaviorNormalizer(), 'Singleton');
  container.registerFactory(FeatureBehaviorTokens.Validator, () => new FeatureBehaviorValidator(), 'Singleton');
  container.registerFactory(FeatureBehaviorTokens.Resolver, () => new FeatureFlowResolver(), 'Singleton');
  container.registerFactory(FeatureBehaviorTokens.Analyzer, () => new FeatureBehaviorAnalyzer(), 'Singleton');
  container.registerFactory(FeatureBehaviorTokens.Explainer, () => new FeatureBehaviorExplainer(), 'Singleton');

  container.registerFactory(
    FeatureBehaviorTokens.Engine,
    c =>
      new FeatureBehaviorEngine(c.resolve(FeatureBehaviorTokens.Repository), {
        flowBuilder: c.resolve(FeatureBehaviorTokens.FlowBuilder),
        normalizer: c.resolve(FeatureBehaviorTokens.Normalizer),
        validator: c.resolve(FeatureBehaviorTokens.Validator),
        resolver: c.resolve(FeatureFlowResolver ? FeatureBehaviorTokens.Resolver : FeatureBehaviorTokens.Resolver),
        analyzer: c.resolve(FeatureBehaviorTokens.Analyzer),
        explainer: c.resolve(FeatureBehaviorTokens.Explainer),
      }),
    'Singleton'
  );

  container.registerFactory(
    FeatureBehaviorTokens.API,
    c =>
      new FeatureBehaviorAPI(
        c.resolve(FeatureBehaviorTokens.Engine),
        c.resolve(FeatureBehaviorTokens.Repository)
      ),
    'Singleton'
  );
}
