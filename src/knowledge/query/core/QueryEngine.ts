import { IQuery, IQueryResult } from '../models/IQueryResult';
import { QueryPlanner } from './QueryPlanner';
import { QueryExecutor } from './QueryExecutor';
import { QueryValidator } from './QueryValidator';
import { QueryExplainer } from './QueryExplainer';
import { QueryCache } from '../cache/QueryCache';
import { KernelEventDispatcher } from '../../../kernel/core/KernelEventDispatcher';
import { QUERY_STARTED, QUERY_COMPLETED, QUERY_FAILED, QUERY_CACHE_HIT, QUERY_CACHE_MISS } from '../types/QueryEvents';
import crypto from 'crypto';

export class QueryEngine {
  constructor(
    private planner: QueryPlanner,
    private executor: QueryExecutor,
    private explainer: QueryExplainer,
    private validator: QueryValidator,
    private cache: QueryCache,
    private dispatcher: KernelEventDispatcher,
    private knowledgeVersion: string = 'v1'
  ) {}

  public query(q: IQuery): IQueryResult {
    this.dispatcher.publish(QUERY_STARTED, { entity: q.entity, operation: q.operation });

    try {
      this.validator.validate(q);

      const cacheKey = this.cache.generateKey(q, this.knowledgeVersion);
      const cached = this.cache.get(cacheKey);

      if (cached) {
        this.dispatcher.publish(QUERY_CACHE_HIT, { key: cacheKey });
        return cached;
      }

      this.dispatcher.publish(QUERY_CACHE_MISS, { key: cacheKey });

      const plan = this.planner.plan(q);
      const executionResult = this.executor.execute(q, plan);

      const explanation = this.explainer.explain(q, executionResult.data, executionResult.sources);

      const result: IQueryResult = {
        queryId: crypto.randomUUID(),
        queryType: `${q.entity}:${q.operation}`,
        data: executionResult.data,
        sources: executionResult.sources,
        confidence: 1.0,
        generatedAt: Date.now(),
        knowledgeVersion: this.knowledgeVersion,
        snapshotId: q.snapshotId || 'latest',
        explanation
      };

      this.validator.sanitizeResult(result);
      
      this.cache.set(cacheKey, result);
      
      this.dispatcher.publish(QUERY_COMPLETED, { queryId: result.queryId });
      return result;

    } catch (err: any) {
      this.dispatcher.publish(QUERY_FAILED, { error: err.message });
      throw err;
    }
  }
}
