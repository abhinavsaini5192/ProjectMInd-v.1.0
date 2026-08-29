export interface ILanguageAdapter {
  isSupported(fileExtension: string): boolean;
  parse(content: string): any; // Returns an AST object
  findSymbolRange(ast: any, symbolName: string): { startLine: number, endLine: number } | null;
  verifySyntax(content: string): boolean;
}
