import { LanguageParser } from './interfaces/LanguageParser';
import { ProjectMindError } from '../errors';

/**
 * Registry for dynamically loaded language parsers.
 */
export class ParserFramework {
  private parsers: Map<string, LanguageParser> = new Map();

  /**
   * Registers a parser instance to handle specific file extensions.
   */
  public registerParser(parser: LanguageParser): void {
    for (const ext of parser.extensions) {
      if (this.parsers.has(ext)) {
        throw new ProjectMindError(`Extension ${ext} is already registered to a parser.`, 'PARSER_CONFLICT');
      }
      this.parsers.set(ext, parser);
    }
  }

  /**
   * Retrieves a parser by file extension.
   */
  public getParser(extension: string): LanguageParser | undefined {
    return this.parsers.get(extension);
  }

  /**
   * Returns all registered parsers.
   */
  public getAllParsers(): LanguageParser[] {
    const unique = new Set(this.parsers.values());
    return Array.from(unique);
  }
}
