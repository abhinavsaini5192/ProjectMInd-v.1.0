import { IQuery, IQueryResult } from '../models/IQueryResult';
import { QueryPlan } from './QueryPlanner';
import { QueryRegistry } from './QueryRegistry';
import crypto from 'crypto';

export class QueryExecutor {
  constructor(private registry: QueryRegistry) {}

  public execute(query: IQuery, plan: QueryPlan): any {
    let resultData: any = {};
    const sources = new Set<string>();

    for (const step of plan.steps) {
      // 'FeatureAPI' -> entity = 'feature'
      const entity = step.executorTarget.replace('API', '').toLowerCase();
      const handler = this.registry.getHandler(entity);

      if (!handler) {
        throw new Error(`No handler registered for entity: ${entity}`);
      }

      // Execute the method on the handler
      const stepResult = handler.execute(step.method, step.arguments);
      
      // Merge results
      if (stepResult.data) {
        resultData = { ...resultData, ...stepResult.data };
      }
      if (stepResult.sources) {
        for (const s of stepResult.sources) sources.add(s);
      }
    }

    return {
      data: resultData,
      sources: Array.from(sources)
    };
  }
}
