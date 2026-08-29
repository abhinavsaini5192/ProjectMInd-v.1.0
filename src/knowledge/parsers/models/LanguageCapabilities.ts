export interface LanguageCapabilities {
  supportsFunctions: boolean;
  supportsClasses: boolean;
  supportsInterfaces: boolean;
  supportsEnums: boolean;
  supportsModules: boolean;
  supportsNamespaces: boolean;
  supportsDecorators: boolean;
  supportsAnnotations: boolean;
  supportsMacros: boolean;
  supportsTemplates: boolean;
  supportsGenerics: boolean;
  supportsIncrementalParsing: boolean;
  supportsDocumentationExtraction: boolean;
}

export interface LanguageMetadata {
  id: string; // e.g., 'typescript'
  name: string; // e.g., 'TypeScript'
  extensions: string[];
  manifestFiles: string[]; // e.g., ['package.json', 'tsconfig.json']
}

export interface IntermediateASTNode {
  type: string;
  name?: string;
  startPosition: { row: number; column: number };
  endPosition: { row: number; column: number };
  children: IntermediateASTNode[];
  rawText?: string;
}

export interface ParserResult {
  filePath: string;
  language: string;
  ast: IntermediateASTNode;
  parseTimeMs: number;
  isCached: boolean;
}
