import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DiffEngine } from '../../src/intelligence/core/DiffEngine';
import { ASTComparator } from '../../src/intelligence/core/ASTComparator';
import { RepositoryScanner } from '../../src/intelligence/core/RepositoryScanner';
import { SemanticEventEngine } from '../../src/intelligence/core/SemanticEventEngine';
import { ArchitectureAnalyzer } from '../../src/intelligence/core/ArchitectureAnalyzer';
import { UpdatePlanners } from '../../src/intelligence/core/UpdatePlanners';
import { ImpactAnalyzer } from '../../src/intelligence/core/ImpactAnalyzer';
import { RepositoryIntelligenceEngine } from '../../src/intelligence/core/RepositoryIntelligenceEngine';
import { FeatureDetector } from '../../src/intelligence/core/FeatureDetector';
import { BreakingChangeDetector } from '../../src/intelligence/core/BreakingChangeDetector';
import { RefactorDetector } from '../../src/intelligence/core/RefactorDetector';
import { DependencyAnalyzer } from '../../src/intelligence/core/DependencyAnalyzer';
import { GraphTraversalEngine } from '../../src/graph/core/GraphTraversalEngine';
import { GraphQueryEngine } from '../../src/graph/core/GraphQueryEngine';
import { KuzuKnowledgeStore } from '../../src/graph/providers/KuzuKnowledgeStore';
import { StructuredLogger } from '../../src/workspace/logging/StructuredLogger';
import { SemanticEventType } from '../../src/intelligence/models/SemanticEvent';
import { ChangeType } from '../../src/intelligence/models/RepositoryChange';

describe('Repository Intelligence Engine', () => {
  let engine: RepositoryIntelligenceEngine;

  beforeEach(() => {
    const logger = new StructuredLogger();
    vi.spyOn(logger, 'info').mockImplementation(() => {});

    // Mock Graph Traversals
    const mockStore = {} as KuzuKnowledgeStore;
    const query = new GraphQueryEngine(mockStore);
    const traversal = new GraphTraversalEngine(query);
    vi.spyOn(traversal, 'getImpact').mockResolvedValue(['dependent_mod1']);

    const diff = new DiffEngine();
    const ast = new ASTComparator();
    const scanner = new RepositoryScanner();
    const feat = new FeatureDetector();
    const breakDet = new BreakingChangeDetector();
    const refac = new RefactorDetector();
    const depAnalyzer = new DependencyAnalyzer();
    
    const semantic = new SemanticEventEngine(feat, breakDet, refac, depAnalyzer);
    const arch = new ArchitectureAnalyzer(traversal);
    const impact = new ImpactAnalyzer(traversal);
    const planners = new UpdatePlanners(impact);

    engine = new RepositoryIntelligenceEngine(
      diff, ast, scanner, semantic, arch, planners, logger
    );
  });

  it('should detect a Breaking Change when an exported function is deleted', async () => {
    const oldContent = `export function oldAuth() {}`;
    const newContent = ``;
    const exportedSymbols = new Set(['oldAuth']);

    const { events } = await engine.processChange(
      '/src/auth.ts', oldContent, newContent, exportedSymbols, {}, {}
    );

    const breaking = events.find(e => e.type === SemanticEventType.BreakingChange);
    expect(breaking).toBeDefined();
    expect(breaking?.description).toContain("Exported symbol 'oldAuth' was removed");
  });

  it('should detect a Feature Added when new logic is exported', async () => {
    const oldContent = ``;
    const newContent = `export class UserService {}`;
    const exportedSymbols = new Set(['UserService']);

    const { events } = await engine.processChange(
      '/src/user.ts', oldContent, newContent, exportedSymbols, {}, {}
    );

    const feature = events.find(e => e.type === SemanticEventType.FeatureAdded);
    expect(feature).toBeDefined();
    expect(feature?.description).toContain("Added logic in 1 file(s)");
  });

  it('should detect Dependency Updated events', async () => {
    const oldDeps = { 'kuzu': '0.1.0' };
    const newDeps = { 'kuzu': '0.2.0', 'lodash': '4.17.21' };

    const { events } = await engine.processChange(
      'package.json', '', '', new Set(), oldDeps, newDeps
    );

    const depEvent = events.find(e => e.type === SemanticEventType.DependencyUpdated);
    expect(depEvent).toBeDefined();
    expect(depEvent?.description).toContain("Updated 2 dependencies");
  });

  it('should output Context Updates blast radius from ImpactAnalyzer', async () => {
    const oldContent = `export function coreLogic() {}`;
    const newContent = `export function coreLogic(withNewArg) {}`;
    const exportedSymbols = new Set(['coreLogic']);

    const { events, contextUpdates } = await engine.processChange(
      '/src/core.ts', oldContent, newContent, exportedSymbols, {}, {}
    );

    expect(events.find(e => e.type === SemanticEventType.BreakingChange)).toBeDefined();
    
    // Impact analyzer was mocked to return 'dependent_mod1'
    expect(contextUpdates).toContain('dependent_mod1');
  });

  it('should correctly parse diffs using DiffEngine heuristics', () => {
    const diff = new DiffEngine();
    const rawDiff = `diff --git a/fileA.ts b/fileA.ts\ndeleted file mode 100644`;
    const changes = diff.parseDiff(rawDiff);

    expect(changes.length).toBe(1);
    expect(changes[0].changeType).toBe(ChangeType.Deleted);
    expect(changes[0].path).toBe('fileA.ts');
  });
});
