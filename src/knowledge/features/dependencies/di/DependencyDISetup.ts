import type { DIContainer } from '../../../../workspace/di/DIContainer';
import { FeatureDependencyEngine } from '../core/FeatureDependencyEngine';
import { FeatureDependencyGraph } from '../core/FeatureDependencyGraph';
import { FeatureRelationshipRepository } from '../repository/FeatureRelationshipRepository';
import { FeatureRelationshipScorer } from '../core/FeatureRelationshipScorer';
import { FeatureRelationshipValidator } from '../core/FeatureRelationshipValidator';
import { FeatureRelationshipResolver } from '../core/FeatureRelationshipResolver';
import { FeatureDependencyExplainer } from '../core/FeatureDependencyExplainer';
import { FeatureDependencyAPI } from '../api/FeatureDependencyAPI';

export const FeatureDependencyTokens = {
  Repository: Symbol('FeatureRelationshipRepository'),
  Graph: Symbol('FeatureDependencyGraph'),
  Scorer: Symbol('FeatureRelationshipScorer'),
  Validator: Symbol('FeatureRelationshipValidator'),
  Resolver: Symbol('FeatureRelationshipResolver'),
  Explainer: Symbol('FeatureDependencyExplainer'),
  Engine: Symbol('FeatureDependencyEngine'),
  API: Symbol('FeatureDependencyAPI'),
};

export function registerFeatureDependencyServices(
  container: DIContainer,
  registryInstance: any,
  repositoryInstance?: FeatureRelationshipRepository,
  graphInstance?: FeatureDependencyGraph
): void {
  const repo = repositoryInstance || new FeatureRelationshipRepository();
  const graph = graphInstance || new FeatureDependencyGraph();

  container.registerFactory(FeatureDependencyTokens.Repository, () => repo, 'Singleton');
  container.registerFactory(FeatureDependencyTokens.Graph, () => graph, 'Singleton');
  container.registerFactory(FeatureDependencyTokens.Scorer, () => new FeatureRelationshipScorer(), 'Singleton');
  container.registerFactory(FeatureDependencyTokens.Validator, () => new FeatureRelationshipValidator(), 'Singleton');
  container.registerFactory(FeatureDependencyTokens.Resolver, () => new FeatureRelationshipResolver(), 'Singleton');
  container.registerFactory(FeatureDependencyTokens.Explainer, () => new FeatureDependencyExplainer(), 'Singleton');

  container.registerFactory(
    FeatureDependencyTokens.Engine,
    (c) =>
      new FeatureDependencyEngine(
        registryInstance,
        c.resolve(FeatureDependencyTokens.Repository),
        c.resolve(FeatureDependencyTokens.Graph),
        undefined, // default 10 sources
        c.resolve(FeatureDependencyTokens.Scorer),
        c.resolve(FeatureDependencyTokens.Validator),
        c.resolve(FeatureDependencyTokens.Resolver),
        c.resolve(FeatureDependencyTokens.Explainer)
      ),
    'Singleton'
  );

  container.registerFactory(
    FeatureDependencyTokens.API,
    (c) => new FeatureDependencyAPI(c.resolve(FeatureDependencyTokens.Engine)),
    'Singleton'
  );
}
