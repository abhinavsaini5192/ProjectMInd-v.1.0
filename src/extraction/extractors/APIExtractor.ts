import { Parser, Tree, Node, Language } from 'web-tree-sitter';
import { Fact } from '../models/Fact';
import { FactBuilder } from '../FactBuilder';

export class APIExtractor {
  public static extractTypescriptAPI(tree: Tree, filePath: string, commitHash: string): Fact[] {
    const facts: Fact[] = [];
    const walk = (node: Node) => {
      if (node.type === 'export_statement') {
        // Find what is being exported
        const declaration = node.children.find(n => n.type === 'class_declaration' || n.type === 'function_declaration' || n.type === 'lexical_declaration');
        if (declaration) {
          const nameNode = declaration.type === 'lexical_declaration' 
            ? declaration.children.find(n => n.type === 'variable_declarator')?.childForFieldName('name')
            : declaration.childForFieldName('name');
            
          if (nameNode) {
             facts.push(FactBuilder.buildFact({
               id: FactBuilder.generateId('export', filePath, nameNode.text),
               type: 'FunctionAdded', // Simplified for MVP
               language: 'typescript',
               sourceFile: filePath,
               timestamp: Date.now(),
               version: commitHash,
               metadata: { is_exported: true, name: nameNode.text }
             }));
          }
        }
      }
      for (const child of node.children) {
        walk(child);
      }
    };
    walk(tree.rootNode);
    return facts;
  }
}
