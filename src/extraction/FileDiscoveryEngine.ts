import * as path from 'path';
import { ChangeObject } from './models/ChangeObject';
import { LanguageParser } from './interfaces/LanguageParser';

/**
 * Responsible for filtering files against supported languages and ignored paths.
 */
export class FileDiscoveryEngine {
  private ignoredPaths: string[];
  private parsers: Map<string, LanguageParser> = new Map();

  constructor(ignoredPaths: string[] = ['node_modules', '.venv', 'vendor', '.git']) {
    this.ignoredPaths = ignoredPaths;
  }

  /**
   * Registers a parser to the discovery engine, mapping its extensions.
   */
  public registerParser(parser: LanguageParser): void {
    for (const ext of parser.extensions) {
      this.parsers.set(ext, parser);
    }
  }

  /**
   * Filters raw Git changes down to only supported and non-ignored files.
   */
  public filterChanges(changes: ChangeObject[]): ChangeObject[] {
    return changes.filter(change => {
      // Check ignored paths
      for (const ignore of this.ignoredPaths) {
        if (change.path.includes(ignore)) return false;
      }
      
      // Check supported extensions
      const ext = path.extname(change.path);
      if (!this.parsers.has(ext)) return false;

      return true;
    });
  }

  /**
   * Retrieves the correct parser for a given file path.
   */
  public getParserForFile(filePath: string): LanguageParser | undefined {
    const ext = path.extname(filePath);
    return this.parsers.get(ext);
  }
}
