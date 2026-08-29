import { describe, it, expect, beforeEach } from 'vitest';
import { QueryEngine } from '../../src/knowledge/query/core/QueryEngine';
import { QueryPlanner } from '../../src/knowledge/query/core/QueryPlanner';
import { QueryExecutor } from '../../src/knowledge/query/core/QueryExecutor';
import { QueryExplainer } from '../../src/knowledge/query/core/QueryExplainer';
import { QueryValidator } from '../../src/knowledge/query/core/QueryValidator';
import { QueryRegistry } from '../../src/knowledge/query/core/QueryRegistry';
import { QueryCache } from '../../src/knowledge/query/cache/QueryCache';
import { QueryInvalidator } from '../../src/knowledge/query/cache/QueryInvalidator';
import { FeatureQueryAPI } from '../../src/knowledge/query/api/FeatureQueryAPI';
import { SymbolQueryAPI } from '../../src/knowledge/query/api/SymbolQueryAPI';
import { KernelEventDispatcher } from '../../src/kernel/core/KernelEventDispatcher';
import { IQuery } from '../../src/knowledge/query/models/IQuery';

describe('Repository Query Engine', () => {
  let engine: QueryEngine;
  let registry: QueryRegistry;
  let cache: QueryCache;
  let dispatcher: KernelEventDispatcher;

  beforeEach(() => {
    registry = new QueryRegistry();
    registry.registerHandler('feature', new FeatureQueryAPI());
    registry.registerHandler('symbol', new SymbolQueryAPI());

    const planner = new QueryPlanner();
    const executor = new QueryExecutor(registry);
    const explainer = new QueryExplainer();
    const validator = new QueryValidator();
    cache = new QueryCache();
    dispatcher = new KernelEventDispatcher();
    const invalidator = new QueryInvalidator(cache, dispatcher);
    invalidator.listen();

    engine = new QueryEngine(planner, executor, explainer, validator, cache, dispatcher, 'v1');
  });

  it('should successfully execute a simple feature query', () => {
    const q: IQuery = {
      entity: 'feature',
      operation: 'find',
      filters: { name: 'Authentication' }
    };

    const result = engine.query(q);

    expect(result.data.feature).toBeDefined();
    expect(result.data.feature.name).toBe('Authentication');
    expect(result.explanation).toBeDefined();
    expect(result.explanation!.indexesHit).toContain('featureIndex');
  });

  it('should execute a query with includes', () => {
    const q: IQuery = {
      entity: 'feature',
      operation: 'find',
      filters: { name: 'Authentication' },
      include: ['dependencies']
    };

    const result = engine.query(q);

    expect(result.data.feature).toBeDefined();
    expect(result.data.dependencies).toBeDefined();
    expect(result.data.dependencies).toContain('dep_1');
  });

  it('should cache results and return cache hits', () => {
    let cacheHits = 0;
    dispatcher.subscribe('Query:CacheHit', () => cacheHits++);

    const q: IQuery = {
      entity: 'symbol',
      operation: 'find',
      filters: { name: 'UserService' }
    };

    engine.query(q); // Miss
    engine.query(q); // Hit
    engine.query(q); // Hit

    expect(cacheHits).toBe(2);
  });

  it('should invalidate cache when kernel fires evolution event', () => {
    let cacheHits = 0;
    let cacheMisses = 0;
    dispatcher.subscribe('Query:CacheHit', () => cacheHits++);
    dispatcher.subscribe('Query:CacheMiss', () => cacheMisses++);

    const q: IQuery = {
      entity: 'feature',
      operation: 'find',
      filters: { name: 'Payment' }
    };

    engine.query(q); // Miss
    engine.query(q); // Hit

    // Simulate backend data change
    dispatcher.publish('Feature:Updated', {});

    engine.query(q); // Miss again due to invalidation

    expect(cacheHits).toBe(1);
    expect(cacheMisses).toBe(2);
  });

  it('should redact sensitive information from queries and results', () => {
    const q: IQuery = {
      entity: 'symbol',
      operation: 'find',
      filters: { name: 'AwsSecretKey' }
    };

    expect(() => engine.query(q)).toThrowError(/Security Violation/);
  });
});
