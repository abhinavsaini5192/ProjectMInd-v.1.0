import { Service } from '../interfaces';
import { PersistenceEngine } from './PersistenceEngine';
import { SchemaManager, KnowledgeValidator } from './ValidationEngines';
import { MemoryStore, IncrementalMergeEngine } from './CoreEngines';
import { VersionManager, HistoryEngine, SnapshotManager } from './HistoryEngines';
import { CompressionEngine, GarbageCollector } from './OptimizationEngines';
import { KnowledgeGraph } from '../intelligence/engines/KnowledgeGraphBuilder';
import { ProjectMindError } from '../errors';

/**
 * Facade for Phase 5 Memory Engine.
 * Wires as a Service into the Phase 1 Kernel.
 */
export class MemoryEngineService implements Service {
  public readonly name = 'memory-engine';
  
  public persistence: PersistenceEngine;
  public store: MemoryStore;
  public mergeEngine: IncrementalMergeEngine;
  public history: HistoryEngine;
  public validator: KnowledgeValidator;
  public compressor: CompressionEngine;
  public versionManager: VersionManager;
  public snapshotManager: SnapshotManager;

  constructor(workspacePath: string) {
    this.persistence = new PersistenceEngine(workspacePath);
    this.store = new MemoryStore();
    this.mergeEngine = new IncrementalMergeEngine();
    this.history = new HistoryEngine(this.persistence);
    this.validator = new KnowledgeValidator();
    this.compressor = new CompressionEngine();
    this.versionManager = new VersionManager();
    this.snapshotManager = new SnapshotManager();
  }

  public async initialize(): Promise<void> {
    await this.loadMemory();
  }

  public async shutdown(): Promise<void> {
    await this.saveMemory();
  }

  /**
   * Integrates an incoming semantic graph update securely into the persistent store.
   */
  public async commitUpdate(incomingGraph: KnowledgeGraph): Promise<void> {
    try {
      // 1. Merge incrementally
      this.mergeEngine.merge(this.store, incomingGraph);
      
      // 2. Validate
      const validation = this.validator.validate(this.store.getGraph());
      if (!validation.valid) {
        // We log warning but don't strictly crash for MVP
        console.warn(`Memory validation warnings: ${validation.errors.join(', ')}`);
      }

      // 3. Update History
      for (const event of incomingGraph.semanticEvents) {
        await this.history.recordSemanticEvent(event);
      }

      // 4. Compress
      const compressedGraph = this.compressor.compress(this.store.getGraph());
      
      // 5. Version
      const v = this.versionManager.bumpVersion();

      // 6. Persist Atomically
      await this.persistence.writeAtomicJson('graph/latest.json', compressedGraph);
      
      // 7. Snapshot every 10 versions
      if (v % 10 === 0) {
        await this.snapshotManager.createSnapshot(v);
      }
    } catch (err: any) {
      throw new ProjectMindError(`Failed to commit memory update: ${err.message}`, 'MEMORY_COMMIT_FAILED');
    }
  }

  /**
   * Loads the memory store from disk.
   */
  public async loadMemory(): Promise<void> {
    const data = await this.persistence.readJson<KnowledgeGraph>('graph/latest.json');
    if (data) {
      // Rehydrate Maps
      const graph: KnowledgeGraph = {
        facts: new Map(Object.entries(data.facts || {})),
        semanticEvents: data.semanticEvents || [],
        architecturalEvents: data.architecturalEvents || []
      };
      this.store = new MemoryStore(graph);
    }
  }

  /**
   * Saves current state to disk securely.
   */
  public async saveMemory(): Promise<void> {
    const graph = this.store.getGraph();
    // Serialize Maps for JSON
    const serializedGraph = {
      facts: Object.fromEntries(graph.facts),
      semanticEvents: graph.semanticEvents,
      architecturalEvents: graph.architecturalEvents
    };
    await this.persistence.writeAtomicJson('graph/latest.json', serializedGraph);
  }
}
