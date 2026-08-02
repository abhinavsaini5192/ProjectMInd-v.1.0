import { Parser, Tree, Node, Language } from 'web-tree-sitter';
import { Fact } from '../models/Fact';
import { FactBuilder } from '../FactBuilder';

/**
 * Common traversal logic for Symbol Extraction (classes, functions, etc.).
 */
export class SymbolExtractor {
  public static extractTypescriptSymbols(tree: Tree, filePath: string, commitHash: string): Fact[] {
    const facts: Fact[] = [];
    const rootNode = tree.rootNode;
    const now = Date.now();

    // Very simplified tree-walk to find classes and functions
    const walk = (node: Node) => {
      if (node.type === 'class_declaration') {
        const nameNode = node.childForFieldName('name');
        if (nameNode) {
          facts.push(FactBuilder.buildFact({
            id: FactBuilder.generateId('class', filePath, nameNode.text),
            type: 'ClassAdded',
            language: 'typescript',
            sourceFile: filePath,
            timestamp: now,
            version: commitHash,
            metadata: {
              name: nameNode.text,
              start_line: node.startPosition.row + 1,
              end_line: node.endPosition.row + 1
            }
          }));
        }
      }

      if (node.type === 'function_declaration' || node.type === 'arrow_function' || node.type === 'method_definition') {
        const nameNode = node.childForFieldName('name');
        if (nameNode) {
          facts.push(FactBuilder.buildFact({
            id: FactBuilder.generateId('function', filePath, nameNode.text),
            type: 'FunctionAdded',
            language: 'typescript',
            sourceFile: filePath,
            timestamp: now,
            version: commitHash,
            metadata: {
              name: nameNode.text,
              start_line: node.startPosition.row + 1,
              end_line: node.endPosition.row + 1
            }
          }));
        }
      }

      for (const child of node.children) {
        walk(child);
      }
    };

    walk(rootNode);
    return facts;
  }
  
  public static extractPythonSymbols(tree: Tree, filePath: string, commitHash: string): Fact[] {
    const facts: Fact[] = [];
    const rootNode = tree.rootNode;
    const now = Date.now();

    const walk = (node: Node) => {
      if (node.type === 'class_definition') {
        const nameNode = node.childForFieldName('name');
        if (nameNode) {
          facts.push(FactBuilder.buildFact({
            id: FactBuilder.generateId('class', filePath, nameNode.text),
            type: 'ClassAdded',
            language: 'python',
            sourceFile: filePath,
            timestamp: now,
            version: commitHash,
            metadata: {
              name: nameNode.text,
              start_line: node.startPosition.row + 1,
              end_line: node.endPosition.row + 1
            }
          }));
        }
      }

      if (node.type === 'function_definition') {
        const nameNode = node.childForFieldName('name');
        if (nameNode) {
          facts.push(FactBuilder.buildFact({
            id: FactBuilder.generateId('function', filePath, nameNode.text),
            type: 'FunctionAdded',
            language: 'python',
            sourceFile: filePath,
            timestamp: now,
            version: commitHash,
            metadata: {
              name: nameNode.text,
              start_line: node.startPosition.row + 1,
              end_line: node.endPosition.row + 1
            }
          }));
        }
      }

      for (const child of node.children) {
        walk(child);
      }
    };

    walk(rootNode);
    return facts;
  }
}
