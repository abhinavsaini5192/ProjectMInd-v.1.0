import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { MemoryEngineService } from '../src/memory/MemoryEngineService';
import { KnowledgeGraph } from '../src/intelligence/engines/KnowledgeGraphBuilder';
import { Fact } from '../src/extraction/models/Fact';

describe('MemoryEngineService', () => {
  const testWorkspace = path.join(__dirname, 'test-memory-workspace');

  beforeEach(() => {
    if (!fs.existsSync(testWorkspace)) {
      fs.mkdirSync(testWorkspace, { recursive: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(testWorkspace)) {
      fs.rmSync(testWorkspace, { recursive: true, force: true });
    }
  });

  it('should incrementally merge and persist knowledge securely', async () => {
    const engine = new MemoryEngineService(testWorkspace);
    await engine.initialize();

    const incomingGraph: KnowledgeGraph = {
      facts: new Map<string, Fact>([
        ['class:src/app.ts#App', {
          id: 'class:src/app.ts#App',
          type: 'ClassAdded',
          language: 'typescript',
          sourceFile: 'src/app.ts',
          timestamp: 123,
          version: 'abc',
          confidence: 1.0
        }]
      ]),
      semanticEvents: [
        { type: 'FeatureAdded', summary: 'Added App Class', confidence: 'High' as any, reasoning: '' }
      ],
      architecturalEvents: []
    };

    await engine.commitUpdate(incomingGraph);
    await engine.shutdown();

    // Verify .projectmind folder structure
    expect(fs.existsSync(path.join(testWorkspace, '.projectmind', 'graph', 'latest.json'))).toBe(true);
    expect(fs.existsSync(path.join(testWorkspace, '.projectmind', 'history', 'semantic_timeline.jsonl'))).toBe(true);

    // Verify loading works
    const newEngine = new MemoryEngineService(testWorkspace);
    await newEngine.loadMemory();
    
    const loadedGraph = newEngine.store.getGraph();
    expect(loadedGraph.facts.has('class:src/app.ts#App')).toBe(true);
    expect(loadedGraph.semanticEvents.length).toBe(1);
  });
});
