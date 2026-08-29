import { IParser } from '../../interfaces/IParser';
import { LanguageCapabilities, ParserResult } from '../../models/LanguageCapabilities';
import { TreeSitterAdapter } from '../../core/TreeSitterAdapter';

export class CppParser implements IParser {
  public readonly language = 'cpp';
  private adapter = new TreeSitterAdapter();
  public detect(filePath: string): boolean { return filePath.match(/\.(cpp|cc|cxx|hpp)$/) !== null; }
  public async parseFile(filePath: string, content: string): Promise<ParserResult> {
    return { filePath, language: this.language, ast: this.adapter.parse(content), parseTimeMs: 0, isCached: false };
  }
  public async parseDirectory(): Promise<ParserResult[]> { return []; }
  public supportsIncrementalParsing(): boolean { return true; }
  public getCapabilities(): LanguageCapabilities {
    return {
      supportsFunctions: true, supportsClasses: true, supportsInterfaces: false, supportsEnums: true,
      supportsModules: false, supportsNamespaces: true, supportsDecorators: false, supportsAnnotations: false,
      supportsMacros: true, supportsTemplates: true, supportsGenerics: true,
      supportsIncrementalParsing: true, supportsDocumentationExtraction: true
    };
  }
  public dispose(): void {}
}
