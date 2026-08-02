import { Parser, Tree, Node, Language } from 'web-tree-sitter';

/**
 * Common traversal logic for Dependency Extraction (imports, requires).
 */
export class DependencyExtractor {
  public static extractTypescriptDependencies(tree: Tree, filePath: string): Array<{ target: string; type: 'imports' }> {
    const deps: Array<{ target: string; type: 'imports' }> = [];
    
    const walk = (node: Node) => {
      if (node.type === 'import_statement') {
        const sourceNode = node.children.find(n => n.type === 'string');
        if (sourceNode) {
          // Remove quotes
          const importPath = sourceNode.text.replace(/['"]/g, '');
          deps.push({ target: importPath, type: 'imports' });
        }
      }
      for (const child of node.children) {
        walk(child);
      }
    };
    
    walk(tree.rootNode);
    return deps;
  }
  
  public static extractPythonDependencies(tree: Tree, filePath: string): Array<{ target: string; type: 'imports' }> {
    const deps: Array<{ target: string; type: 'imports' }> = [];
    
    const walk = (node: Node) => {
      if (node.type === 'import_statement' || node.type === 'import_from_statement') {
        const moduleNode = node.children.find(n => n.type === 'dotted_name');
        if (moduleNode) {
          deps.push({ target: moduleNode.text, type: 'imports' });
        }
      }
      for (const child of node.children) {
        walk(child);
      }
    };
    
    walk(tree.rootNode);
    return deps;
  }
}
