import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { KuzuKnowledgeStore } from '../../src/graph/providers/KuzuKnowledgeStore';
import { KnowledgeGraphEngine } from '../../src/graph/core/KnowledgeGraphEngine';
import { GraphQueryEngine } from '../../src/graph/core/GraphQueryEngine';
import { GraphTraversalEngine } from '../../src/graph/core/GraphTraversalEngine';
import { GraphBuilder } from '../../src/graph/core/GraphBuilder';
import { StructuredLogger } from '../../src/workspace/logging/StructuredLogger';
import { ProviderState } from '../../src/storage/types/StorageTypes';

describe('Repository Knowledge Graph Engine', () => {
  let store: KuzuKnowledgeStore;
  let engine: KnowledgeGraphEngine;
  let logger: StructuredLogger;

  beforeEach(async () => {
    logger = new StructuredLogger();
    vi.spyOn(logger, 'info').mockImplementation(() => {});
    vi.spyOn(logger, 'error').mockImplementation(() => {});

    store = new KuzuKnowledgeStore(':memory:', logger);
    await store.initialize({ workspaceId: 'test', storageRoot: '', encryptionEnabled: false });

    const query = new GraphQueryEngine(store);
    const traversal = new GraphTraversalEngine(query);
    const builder = new GraphBuilder(store);

    engine = new KnowledgeGraphEngine(store, query, traversal, builder, logger);
    await engine.initialize();
  });

  afterEach(async () => {
    if (store.state === ProviderState.Ready) {
      await store.dispose();
    }
  });

  it('should initialize KuzuDB memory instance and create schema', async () => {
    const health = await store.healthCheck();
    expect(health.isHealthy).toBe(true);

    const stats = await store.getStatistics();
    expect(stats.tableCount).toBe(6); // File, Module, Symbol, CONTAINS, DEPENDS_ON, CALLS
  });

  it('should build graph nodes and edges', async () => {
    await engine.builder.addNode('File', {
      id: 'file1',
      label: 'File',
      properties: { path: '/src/index.ts' }
    });

    await engine.builder.addNode('Module', {
      id: 'mod1',
      label: 'Module',
      properties: { name: 'index' }
    });

    await engine.builder.addEdge('CONTAINS', {
      id: 'edge1',
      sourceId: 'file1',
      targetId: 'mod1',
      label: 'CONTAINS',
      properties: {}
    }, 'File', 'Module');

    // Query validation
    const results = await engine.queryEngine.query('MATCH (a:File)-[:CONTAINS]->(b:Module) RETURN a.path, b.name');
    expect(results.length).toBe(1);
    expect(results[0]['a.path']).toBe('/src/index.ts');
    expect(results[0]['b.name']).toBe('index');
  });

  it('should perform path traversals', async () => {
    // Just a placeholder test confirming the API doesn't throw
    const path = await engine.traversalEngine.findShortestPath('src1', 'tgt1');
    expect(path).toEqual([]);

    const deps = await engine.traversalEngine.getDependencies('mod1', 2);
    expect(deps).toEqual([]);
  });
});
