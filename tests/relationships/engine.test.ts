import { describe, it, expect, beforeEach } from 'vitest';
import { RelationshipEngine } from '../../src/knowledge/relationships/core/RelationshipEngine';
import { RelationshipFactory } from '../../src/knowledge/relationships/core/RelationshipFactory';
import { RelationshipBuilder } from '../../src/knowledge/relationships/core/RelationshipBuilder';
import { RelationshipVersionManager } from '../../src/knowledge/relationships/core/RelationshipVersionManager';
import { RelationshipLifecycleManager, RELATIONSHIP_CREATED, RELATIONSHIP_UPDATED } from '../../src/knowledge/relationships/core/RelationshipLifecycleManager';
import { RelationshipExtractor } from '../../src/knowledge/relationships/extraction/RelationshipExtractor';
import { RelationshipRegistry } from '../../src/knowledge/relationships/extraction/RelationshipRegistry';
import { RelationshipResolver } from '../../src/knowledge/relationships/extraction/RelationshipResolver';
import { RelationshipValidator } from '../../src/knowledge/relationships/validation/RelationshipValidator';
import { KernelEventDispatcher } from '../../src/kernel/core/KernelEventDispatcher';
import { ASTTraverser } from '../../src/knowledge/ast/visitors/ASTTraverser';
import { UniversalNode } from '../../src/knowledge/ast/models/UniversalNode';
import { NodeKind } from '../../src/knowledge/ast/models/NodeKind';
import { RelationshipType } from '../../src/knowledge/relationships/models/RelationshipType';
import { SymbolResolver } from '../../src/knowledge/symbols/extraction/SymbolResolver';
import { SymbolRegistry } from '../../src/knowledge/symbols/extraction/SymbolRegistry';
import { SymbolIndexer } from '../../src/knowledge/symbols/extraction/SymbolIndexer';

describe('Relationship Intelligence Engine', () => {
  let engine: RelationshipEngine;
  let dispatcher: KernelEventDispatcher;
  let resolver: RelationshipResolver;
  let factory: RelationshipFactory;

  beforeEach(() => {
    dispatcher = new KernelEventDispatcher();
    factory = new RelationshipFactory();
    const builder = new RelationshipBuilder(factory);
    const version = new RelationshipVersionManager();
    const lifecycle = new RelationshipLifecycleManager(version, dispatcher);
    
    const registry = new RelationshipRegistry();
    resolver = new RelationshipResolver(registry);
    
    // Mock the Symbol dependencies (L2.3)
    const symRegistry = new SymbolRegistry();
    const symIndexer = new SymbolIndexer(symRegistry);
    const symResolver = new SymbolResolver(symRegistry, symIndexer);

    const extractor = new RelationshipExtractor(builder, symResolver);
    const traverser = new ASTTraverser();
    const validator = new RelationshipValidator(symResolver);

    engine = new RelationshipEngine(traverser, extractor, registry, resolver, lifecycle, validator);
  });

  const createMockNode = (kind: NodeKind, name: string, id: string, parentId?: string): UniversalNode => ({
    id,
    kind,
    name,
    language: 'typescript',
    location: { startRow: 0, startColumn: 0, endRow: 10, endColumn: 0, filePath: '' },
    children: [],
    attributes: {},
    metadata: {},
    version: 1,
    hash: 'mockhash',
    parserVersion: '1.0',
    parentId
  });

  it('should extract parent-child relationships as structural Contains edges', () => {
    const parent = createMockNode(NodeKind.Class, 'Parent', 'parent_id');
    const child = createMockNode(NodeKind.Method, 'Child', 'child_id', 'parent_id');
    parent.children.push(child);

    let created = false;
    dispatcher.subscribe(RELATIONSHIP_CREATED, () => created = true);

    engine.processAST(parent);

    expect(created).toBe(true);

    const outgoing = resolver.getOutgoing('sym_parent_id');
    expect(outgoing.length).toBe(1);
    expect(outgoing[0].targetId).toBe('sym_child_id');
    expect(outgoing[0].type).toBe(RelationshipType.Contains);
    
    const incoming = resolver.getIncoming('sym_child_id');
    expect(incoming.length).toBe(1);
    expect(incoming[0].sourceId).toBe('sym_parent_id');
  });

  it('should generate stable IDs and avoid updating identical edges', () => {
    const parent = createMockNode(NodeKind.Class, 'Parent', 'p1');
    const child = createMockNode(NodeKind.Method, 'Child', 'c1', 'p1');
    parent.children.push(child);

    engine.processAST(parent);
    const initialEdges = resolver.getOutgoing('sym_p1');
    const initialHash = initialEdges[0].version;

    let updated = false;
    dispatcher.subscribe(RELATIONSHIP_UPDATED, () => updated = true);

    // Re-process identical tree
    engine.processAST(parent);

    const newEdges = resolver.getOutgoing('sym_p1');
    expect(updated).toBe(false); // Should not have triggered update
    expect(newEdges[0].version).toBe(initialHash);
  });

  it('should detect self-loops and throw validation errors', () => {
    const validator = new RelationshipValidator(new SymbolResolver(new SymbolRegistry(), new SymbolIndexer(new SymbolRegistry())));
    const builder = new RelationshipBuilder(new RelationshipFactory());

    const badRel = builder.from('sym_a').to('sym_a').withType(RelationshipType.Calls).build();

    expect(() => validator.validate([badRel])).toThrowError(/Self-Loop/);
  });
});
