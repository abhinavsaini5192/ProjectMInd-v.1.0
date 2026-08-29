import { IParser } from '../../interfaces/IParser';
import { LanguageCapabilities, ParserResult } from '../../models/LanguageCapabilities';
import { TreeSitterAdapter } from '../../core/TreeSitterAdapter';

export class PythonParser implements IParser {
  public readonly language = 'python';
  private adapter = new TreeSitterAdapter();

  public detect(filePath: string, content: string): boolean {
    return filePath.endsWith('.py');
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
    return [];
  }

  public supportsIncrementalParsing(): boolean {
    return true;
  }

  public getCapabilities(): LanguageCapabilities {
    return {
      supportsFunctions: true,
      supportsClasses: true,
      supportsInterfaces: false,
      supportsEnums: true,
      supportsModules: true,
      supportsNamespaces: false,
      supportsDecorators: true,
      supportsAnnotations: true, // Type hints
      supportsMacros: false,
      supportsTemplates: false,
      supportsGenerics: true,
      supportsIncrementalParsing: true,
      supportsDocumentationExtraction: true // Docstrings
    };
  }

  public dispose(): void {}
}
