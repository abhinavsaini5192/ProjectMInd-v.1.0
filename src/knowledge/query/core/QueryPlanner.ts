import { IQuery } from '../models/IQuery';

export interface QueryPlan {
  steps: QueryPlanStep[];
}

export interface QueryPlanStep {
  executorTarget: string; // e.g. 'FeatureAPI'
  method: string;
  arguments: any;
}

export class QueryPlanner {
  public plan(query: IQuery): QueryPlan {
    // Deterministic resolution path calculation
    const steps: QueryPlanStep[] = [];

    // The primary lookup
    steps.push({
      executorTarget: `${query.entity}API`,
      method: query.operation,
      arguments: query.filters
    });

    // Handle inclusions (e.g., getting dependencies of a feature)
    if (query.include) {
      for (const inc of query.include) {
        steps.push({
          executorTarget: `${query.entity}API`,
          method: `get${query.entity.charAt(0).toUpperCase() + query.entity.slice(1)}${inc.charAt(0).toUpperCase() + inc.slice(1)}`,
          arguments: { primaryResolution: true } // placeholder chaining
        });
      }
    }

    return { steps };
  }
}
