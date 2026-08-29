import { LanguageMetadata, LanguageCapabilities, ParserResult } from '../models/LanguageCapabilities';

export interface IParser {
  readonly language: string;
  detect(filePath: string, content: string): boolean;
  parseFile(filePath: string, content: string): Promise<ParserResult>;
  parseDirectory(directoryPath: string): Promise<ParserResult[]>;
  supportsIncrementalParsing(): boolean;
  getCapabilities(): LanguageCapabilities;
  dispose(): void;
}

export interface ILanguageDetector {
  detectLanguages(workspacePath: string, files: string[]): Promise<string[]>;
}

export interface IParserRegistry {
  register(parser: IParser): void;
  remove(languageId: string): void;
  resolve(languageId: string): IParser | undefined;
  enumerate(): string[];
}

export interface IParserFactory {
  create(languageId: string): IParser;
}
