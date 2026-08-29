import { describe, it, expect, beforeEach } from 'vitest';
import { UniversalASTEngine } from '../../src/knowledge/ast/core/UniversalASTEngine';
import { ASTNormalizer } from '../../src/knowledge/ast/core/ASTNormalizer';
import { NodeMapper } from '../../src/knowledge/ast/core/NodeMapper';
import { NodeFactory } from '../../src/knowledge/ast/core/NodeFactory';
import { ASTValidator } from '../../src/knowledge/ast/validation/ASTValidator';
import { ASTCache, ASTVersionManager } from '../../src/knowledge/ast/core/ASTVersionManager';
import { IntermediateASTNode } from '../../src/knowledge/parsers/models/LanguageCapabilities';
import { NodeKind } from '../../src/knowledge/ast/models/NodeKind';
import { ASTSerializer, ASTDeserializer } from '../../src/knowledge/ast/serialization/ASTSerializer';
import { ASTTraverser, IASTVisitor } from '../../src/knowledge/ast/visitors/ASTTraverser';

describe('Universal AST Engine', () => {
  let engine: UniversalASTEngine;

  beforeEach(() => {
    const mapper = new NodeMapper();
    const factory = new NodeFactory();
    const normalizer = new ASTNormalizer(mapper, factory);
    const validator = new ASTValidator();
    const cache = new ASTCache();
    const versionManager = new ASTVersionManager();

    engine = new UniversalASTEngine(normalizer, validator, cache, versionManager);
  });

  const getMockIntermediate = (): IntermediateASTNode => ({
    type: 'program',
    startPosition: { row: 1, column: 1 },
    endPosition: { row: 10, column: 1 },
    children: [
      {
        type: 'class_declaration',
        name: 'UserService',
        startPosition: { row: 2, column: 1 },
        endPosition: { row: 9, column: 1 },
        children: [
          {
            type: 'method_definition',
            name: 'login',
            startPosition: { row: 3, column: 3 },
            endPosition: { row: 8, column: 3 },
            children: []
          }
        ]
      }
    ]
  });

  it('should normalize parser AST into Universal AST seamlessly', () => {
    const intermediate = getMockIntermediate();
    const ast = engine.process(intermediate, 'typescript', '/src/user.ts', 'class UserService { login() {} }');

    expect(ast.kind).toBe(NodeKind.File);
    expect(ast.children.length).toBe(1);
    
    const classNode = ast.children[0];
    expect(classNode.kind).toBe(NodeKind.Class);
    expect(classNode.name).toBe('UserService');
    expect(classNode.parentId).toBe(ast.id);
    
    const methodNode = classNode.children[0];
    expect(methodNode.kind).toBe(NodeKind.Method);
    expect(methodNode.name).toBe('login');
    expect(methodNode.parentId).toBe(classNode.id);
  });

  it('should utilize cache on unchanged files', () => {
    const intermediate = getMockIntermediate();
    const rawContent = 'class UserService { login() {} }';
    
    const ast1 = engine.process(intermediate, 'typescript', '/src/user.ts', rawContent);
    const ast2 = engine.process(intermediate, 'typescript', '/src/user.ts', rawContent);

    expect(ast1.id).toBe(ast2.id); // Strict equality check ensuring it came from cache
  });

  it('should validate AST integrity and throw on cycles', () => {
    const validator = new ASTValidator();
    const intermediate = getMockIntermediate();
    const ast = engine.process(intermediate, 'typescript', '/src/user.ts', 'class UserService {}');
    
    expect(() => validator.validate(ast)).not.toThrow();

    // Create a cycle
    ast.children[0].children.push(ast);
    expect(() => validator.validate(ast)).toThrowError(/Cycle/);
  });

  it('should serialize and deserialize cleanly', () => {
    const serializer = new ASTSerializer();
    const deserializer = new ASTDeserializer();

    const intermediate = getMockIntermediate();
    const ast = engine.process(intermediate, 'typescript', '/src/user.ts', 'class UserService {}');

    const json = serializer.serialize(ast);
    const restored = deserializer.deserialize(json);

    expect(restored.id).toBe(ast.id);
    expect(restored.kind).toBe(NodeKind.File);
  });

  it('should support visitor traversal', () => {
    const intermediate = getMockIntermediate();
    const ast = engine.process(intermediate, 'typescript', '/src/user.ts', 'class UserService {}');

    let visitCount = 0;
    const visitor: IASTVisitor = {
      visit: (node) => { visitCount++; }
    };

    const traverser = new ASTTraverser();
    traverser.traverse(ast, [visitor]);

    expect(visitCount).toBe(3); // File, Class, Method
  });
});
