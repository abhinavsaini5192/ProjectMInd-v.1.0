import { Parser, Tree, Node, Language } from 'web-tree-sitter';
import { LanguageParser } from '../interfaces/LanguageParser';
import { Fact } from '../models/Fact';
import { SymbolExtractor } from '../extractors/SymbolExtractor';
import { DependencyExtractor } from '../extractors/DependencyExtractor';
import { APIExtractor } from '../extractors/APIExtractor';

export class TypescriptParser implements LanguageParser {
  public readonly language = 'typescript';
  public readonly extensions = ['.ts', '.tsx'];
  private parser: Parser;

  constructor(parser: Parser) {
    this.parser = parser;
  }

  public parse(sourceCode: string): Tree {
    return this.parser.parse(sourceCode);
  }

  public extractSymbols(tree: Tree, filePath: string, commitHash: string): Fact[] {
    return SymbolExtractor.extractTypescriptSymbols(tree, filePath, commitHash);
  }

  public extractDependencies(tree: Tree, filePath: string): Array<{ target: string; type: 'imports' }> {
    return DependencyExtractor.extractTypescriptDependencies(tree, filePath);
  }

  public extractAPI(tree: Tree, filePath: string): Fact[] {
    return APIExtractor.extractTypescriptAPI(tree, filePath, 'HEAD');
  }
}

export class JavascriptParser implements LanguageParser {
  public readonly language = 'javascript';
  public readonly extensions = ['.js', '.jsx'];
  private parser: Parser;

  constructor(parser: Parser) {
    this.parser = parser;
  }

  public parse(sourceCode: string): Tree {
    return this.parser.parse(sourceCode);
  }

  public extractSymbols(tree: Tree, filePath: string, commitHash: string): Fact[] {
    // JS uses the same AST structure for these basic queries in tree-sitter
    return SymbolExtractor.extractTypescriptSymbols(tree, filePath, commitHash);
  }

  public extractDependencies(tree: Tree, filePath: string): Array<{ target: string; type: 'imports' }> {
    return DependencyExtractor.extractTypescriptDependencies(tree, filePath);
  }

  public extractAPI(tree: Tree, filePath: string): Fact[] {
    return APIExtractor.extractTypescriptAPI(tree, filePath, 'HEAD');
  }
}

export class PythonParser implements LanguageParser {
  public readonly language = 'python';
  public readonly extensions = ['.py'];
  private parser: Parser;

  constructor(parser: Parser) {
    this.parser = parser;
  }

  public parse(sourceCode: string): Tree {
    return this.parser.parse(sourceCode);
  }

  public extractSymbols(tree: Tree, filePath: string, commitHash: string): Fact[] {
    return SymbolExtractor.extractPythonSymbols(tree, filePath, commitHash);
  }

  public extractDependencies(tree: Tree, filePath: string): Array<{ target: string; type: 'imports' }> {
    return DependencyExtractor.extractPythonDependencies(tree, filePath);
  }

  public extractAPI(tree: Tree, filePath: string): Fact[] {
    return []; // Python exports are complex (everything is public by default), simplified for MVP
  }
}
