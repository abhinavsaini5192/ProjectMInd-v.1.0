import { IParser } from '../../interfaces/IParser';
import { LanguageCapabilities, ParserResult } from '../../models/LanguageCapabilities';
import { TreeSitterAdapter } from '../../core/TreeSitterAdapter';

export class TypeScriptParser implements IParser {
  public readonly language = 'typescript';
  private adapter = new TreeSitterAdapter();

  public detect(filePath: string, content: string): boolean {
    return filePath.endsWith('.ts') || filePath.endsWith('.tsx');
  }

  public async parseFile(filePath: string, content: string): Promise<ParserResult> {
    const ast = this.adapter.parse(content);
    return {
      filePath,
      language: this.language,
      ast,
      parseTimeMs: 0,
      isCached: false
    };
  }

  public async parseDirectory(directoryPath: string): Promise<ParserResult[]> {
    return []; // For multi-file concurrent parsing
  }

  public supportsIncrementalParsing(): boolean {
    return true;
  }

  public getCapabilities(): LanguageCapabilities {
    return {
      supportsFunctions: true,
      supportsClasses: true,
      supportsInterfaces: true,
      supportsEnums: true,
      supportsModules: true,
      supportsNamespaces: true,
      supportsDecorators: true,
      supportsAnnotations: false,
      supportsMacros: false,
      supportsTemplates: true, // TS literal types
      supportsGenerics: true,
      supportsIncrementalParsing: true,
      supportsDocumentationExtraction: true
    };
  }

  public dispose(): void {
    // Cleanup adapter
  }
}
