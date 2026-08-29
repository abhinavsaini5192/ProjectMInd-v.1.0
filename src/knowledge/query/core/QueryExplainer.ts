import { IQuery, QueryExplanation } from '../models/IQueryResult';

export class QueryExplainer {
  public explain(query: IQuery, data: any, sources: string[]): QueryExplanation {
    const trace: string[] = [];
    trace.push(`Received query for entity: ${query.entity}`);
    trace.push(`Executed operation: ${query.operation}`);
    
    if (query.filters && Object.keys(query.filters).length > 0) {
      trace.push(`Applied filters: ${JSON.stringify(query.filters)}`);
    }

    if (query.include) {
      trace.push(`Resolved inclusions: ${query.include.join(', ')}`);
    }

    trace.push(`Result generated with ${sources.length} sources`);

    return {
      indexesHit: [`${query.entity}Index`],
      entitiesTraversed: sources,
      relationshipsTraversed: [], // Extracted dynamically in deeper implementations
      snapshotUsed: query.snapshotId || 'current',
      reasoningTrace: trace
    };
  }
}
