import { IParser } from '../../interfaces/IParser';
import { LanguageCapabilities, ParserResult } from '../../models/LanguageCapabilities';
import { TreeSitterAdapter } from '../../core/TreeSitterAdapter';

export class DartParser implements IParser {
  public readonly language = 'dart';
  private adapter = new TreeSitterAdapter();
  public detect(filePath: string): boolean { return filePath.endsWith('.dart'); }
  public async parseFile(filePath: string, content: string): Promise<ParserResult> {
    return { filePath, language: this.language, ast: this.adapter.parse(content), parseTimeMs: 0, isCached: false };
  }
  public async parseDirectory(): Promise<ParserResult[]> { return []; }
  public supportsIncrementalParsing(): boolean { return true; }
  public getCapabilities(): LanguageCapabilities {
    return {
      supportsFunctions: true, supportsClasses: true, supportsInterfaces: true, supportsEnums: true,
      supportsModules: false, supportsNamespaces: false, supportsDecorators: false, supportsAnnotations: true,
      supportsMacros: false, supportsTemplates: false, supportsGenerics: true,
      supportsIncrementalParsing: true, supportsDocumentationExtraction: true
    };
  }
  public dispose(): void {}
}
