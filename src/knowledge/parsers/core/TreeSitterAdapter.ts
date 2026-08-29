import { IntermediateASTNode } from '../models/LanguageCapabilities';

/**
 * Encapsulates the native Tree-sitter interaction.
 * ProjectMind components never see raw Tree-sitter nodes.
 */
export class TreeSitterAdapter {
  constructor() {
    // In reality, this would initialize the WASM runtime or native bindings
    // e.g. require('tree-sitter')
  }

  public setLanguage(languageConfig: any): void {
    // simulated
  }

  public parse(content: string): IntermediateASTNode {
    // Simulate mapping from a raw tree-sitter AST to the ProjectMind Intermediate AST
    return {
      type: 'Program',
      startPosition: { row: 0, column: 0 },
      endPosition: { row: content.split('\n').length, column: 0 },
      children: [], // simulated
      rawText: content
    };
  }
}
