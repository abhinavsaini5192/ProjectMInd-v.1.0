import { Fact } from '../models/Fact';
import * as Parser from 'web-tree-sitter';

/**
 * Standardized contract for all language parsers.
 * The extraction engine is unaware of specific language syntaxes.
 */
export interface LanguageParser {
  /**
   * The target programming language (e.g., 'typescript', 'python').
   */
  readonly language: string;

  /**
   * Supported file extensions (e.g., ['.ts', '.tsx']).
   */
  readonly extensions: string[];

  /**
   * Parses source code into a Tree-sitter AST.
   */
  parse(sourceCode: string): Parser.Tree;

  /**
   * Extracts structural symbols (classes, functions) as standardized Facts.
   */
  extractSymbols(tree: Parser.Tree, filePath: string, commitHash: string): Fact[];

  /**
   * Extracts dependencies (imports, requires) as edges.
   */
  extractDependencies(tree: Parser.Tree, filePath: string): Array<{ target: string; type: 'imports' }>;
  
  /**
   * Extracts public API definitions (exports).
   */
  extractAPI(tree: Parser.Tree, filePath: string): Fact[];
}
