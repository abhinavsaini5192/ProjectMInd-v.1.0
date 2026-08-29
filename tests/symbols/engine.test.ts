import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SymbolEngine } from '../../src/knowledge/symbols/core/SymbolEngine';
import { SymbolIdentityManager } from '../../src/knowledge/symbols/core/SymbolIdentityManager';
import { SymbolVersionManager } from '../../src/knowledge/symbols/core/SymbolVersionManager';
import { SymbolFactory } from '../../src/knowledge/symbols/core/SymbolFactory';
import { SymbolLifecycleManager, SYMBOL_CREATED, SYMBOL_UPDATED } from '../../src/knowledge/symbols/core/SymbolLifecycleManager';
import { SymbolExtractor } from '../../src/knowledge/symbols/extraction/SymbolExtractor';
import { SymbolRegistry } from '../../src/knowledge/symbols/extraction/SymbolRegistry';
import { SymbolIndexer } from '../../src/knowledge/symbols/extraction/SymbolIndexer';
import { SymbolResolver } from '../../src/knowledge/symbols/extraction/SymbolResolver';
import { SymbolValidator } from '../../src/knowledge/symbols/validation/SymbolValidator';
import { KernelEventDispatcher } from '../../src/kernel/core/KernelEventDispatcher';
import { ASTTraverser } from '../../src/knowledge/ast/visitors/ASTTraverser';
import { UniversalNode } from '../../src/knowledge/ast/models/UniversalNode';
import { NodeKind } from '../../src/knowledge/ast/models/NodeKind';
import { SymbolKind } from '../../src/knowledge/symbols/models/SymbolKind';

describe('Symbol Intelligence Engine', () => {
  let engine: SymbolEngine;
  let dispatcher: KernelEventDispatcher;
  let resolver: SymbolResolver;
  let factory: SymbolFactory;

  beforeEach(() => {
    dispatcher = new KernelEventDispatcher();
    const identity = new SymbolIdentityManager();
    const version = new SymbolVersionManager();
    factory = new SymbolFactory(identity, version);
    const lifecycle = new SymbolLifecycleManager(version, dispatcher);
    
    const registry = new SymbolRegistry();
    const indexer = new SymbolIndexer(registry);
    resolver = new SymbolResolver(registry, indexer);
    
    const extractor = new SymbolExtractor(factory, 'repo1', 'workspace1');
    const traverser = new ASTTraverser();
    const validator = new SymbolValidator();

    engine = new SymbolEngine(traverser, extractor, indexer, resolver, lifecycle, validator, dispatcher);
  });

  const createMockNode = (kind: NodeKind, name: string, id: string, rawText: string, children: UniversalNode[] = []): UniversalNode => ({
    id,
    kind,
    name,
    language: 'typescript',
    location: { startRow: 0, startColumn: 0, endRow: 10, endColumn: 0, filePath: '/src/main.ts' },
    children,
    attributes: {},
    metadata: {},
    version: 1,
    hash: 'mockhash',
    parserVersion: '1.0',
    rawText
  });

  it('should extract symbols from a Universal AST and index them', () => {
    const ast = createMockNode(NodeKind.File, 'main.ts', 'file1', '', [
      createMockNode(NodeKind.Class, 'UserService', 'class1', 'class UserService {}')
    ]);

    let createdFired = false;
    dispatcher.subscribe(SYMBOL_CREATED, () => createdFired = true);

    engine.processAST(ast);

    expect(createdFired).toBe(true);
    
    const symbols = resolver.resolveByKind(SymbolKind.Class);
    expect(symbols.length).toBe(1);
    expect(symbols[0].name).toBe('UserService');
    expect(symbols[0].language).toBe('typescript');
  });

  it('should generate stable IDs that survive content changes but trigger updates', () => {
    const originalAst = createMockNode(NodeKind.Class, 'AuthManager', 'class2', 'class AuthManager { /* v1 */ }');
    engine.processAST(originalAst);
    
    const initialSymbol = resolver.resolveByKind(SymbolKind.Class)[0];
    const initialHash = initialSymbol.hash;
    const initialId = initialSymbol.id;

    // Simulate file update (rawText changes, hash should change, ID should remain)
    let updatedFired = false;
    dispatcher.subscribe(SYMBOL_UPDATED, () => updatedFired = true);

    const updatedAst = createMockNode(NodeKind.Class, 'AuthManager', 'class2', 'class AuthManager { /* v2 changed */ }');
    engine.processAST(updatedAst);

    const updatedSymbol = resolver.resolveByKind(SymbolKind.Class)[0];

    expect(updatedFired).toBe(true);
    expect(updatedSymbol.id).toBe(initialId); // Stable ID Check
    expect(updatedSymbol.hash).not.toBe(initialHash); // Hash updated
    expect(updatedSymbol.version).toBe(2);
    expect(updatedSymbol.history.length).toBe(2);
  });

  it('should validate and throw on missing names for tracked symbols', () => {
    const validator = new SymbolValidator();
    const badSymbol = factory.create(SymbolKind.Class, '', 'ts', 'repo', 'ws', 'scope', 'public', { startRow:0, startColumn:0, endRow:0, endColumn:0, filePath:'' }, '');
    
    expect(() => validator.validate([badSymbol])).toThrowError(/missing a name/);
  });

  it('should correctly index and resolve by scope', () => {
    const ast = createMockNode(NodeKind.Class, 'UserController', 'class1', 'class UserController {}');
    ast.parentId = 'parentNamespace1'; // Force scope generation in extractor
    
    engine.processAST(ast);

    const scopedSymbols = resolver.resolveByScope('scope::parentNamespace1');
    expect(scopedSymbols.length).toBe(1);
    expect(scopedSymbols[0].name).toBe('UserController');
  });
});
