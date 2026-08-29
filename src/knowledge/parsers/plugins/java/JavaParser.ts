import { IParser } from '../../interfaces/IParser';
import { LanguageCapabilities, ParserResult } from '../../models/LanguageCapabilities';
import { TreeSitterAdapter } from '../../core/TreeSitterAdapter';

export class JavaParser implements IParser {
  public readonly language = 'java';
  private adapter = new TreeSitterAdapter();

  public detect(filePath: string, content: string): boolean {
    return filePath.endsWith('.java');
  }

  public async parseFile(filePath: string, content: string): Promise<ParserResult> {
    const ast = this.adapter.parse(content);
    return { filePath, language: this.language, ast, parseTimeMs: 0, isCached: false };
  }

  public async parseDirectory(): Promise<ParserResult[]> { return []; }

  public supportsIncrementalParsing(): boolean { return true; }

  public getCapabilities(): LanguageCapabilities {
    return {
      supportsFunctions: true, supportsClasses: true, supportsInterfaces: true, supportsEnums: true,
      supportsModules: true, supportsNamespaces: false, supportsDecorators: false, supportsAnnotations: true,
      supportsMacros: false, supportsTemplates: false, supportsGenerics: true,
      supportsIncrementalParsing: true, supportsDocumentationExtraction: true
    };
  }
  public dispose(): void {}
}
