import { KuzuKnowledgeStore } from '../providers/KuzuKnowledgeStore';
import { ILogger } from '../../workspace/interfaces/ILogger';
import { GraphQueryEngine } from './GraphQueryEngine';
import { GraphTraversalEngine } from './GraphTraversalEngine';
import { GraphBuilder } from './GraphBuilder';

export class KnowledgeGraphEngine {
  constructor(
    private store: KuzuKnowledgeStore,
    public queryEngine: GraphQueryEngine,
    public traversalEngine: GraphTraversalEngine,
    public builder: GraphBuilder,
    private logger: ILogger
  ) {}

  async initialize(): Promise<void> {
    this.logger.info({
      component: 'KnowledgeGraphEngine',
      operation: 'initialize',
      message: 'Knowledge Graph Engine is starting up',
      severity: 'INFO'
    });
  }
}
