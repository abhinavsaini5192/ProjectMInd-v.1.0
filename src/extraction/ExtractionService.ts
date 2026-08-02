import { Service } from '../../interfaces';
import { ASTEngine } from '../ASTEngine';
import { ParserFramework } from '../ParserFramework';
import { DiffEngine } from '../DiffEngine';
import { FileDiscoveryEngine } from '../FileDiscoveryEngine';
import { TypescriptParser, JavascriptParser, PythonParser } from '../parsers/MVParsers';
import { ProjectMindError } from '../../errors';

/**
 * ExtractionService bridges Phase 2 (Extraction) into Phase 1 (Kernel).
 */
export class ExtractionService implements Service {
  public readonly name = 'extraction-engine';
  
  public astEngine: ASTEngine;
  public parserFramework: ParserFramework;
  public diffEngine: DiffEngine;
  public fileDiscovery: FileDiscoveryEngine;

  constructor(workspacePath: string) {
    this.astEngine = new ASTEngine();
    this.parserFramework = new ParserFramework();
    this.diffEngine = new DiffEngine(workspacePath);
    this.fileDiscovery = new FileDiscoveryEngine();
  }

  public async initialize(): Promise<void> {
    try {
      await this.astEngine.initialize();
      // Note: In a real environment, we'd load the .wasm files dynamically based on configuration.
      // For the interface level, we assume ASTEngine is ready.
    } catch (err: any) {
      throw new ProjectMindError(`Failed to initialize ExtractionService: ${err.message}`, 'EXTRACTION_INIT_FAILED');
    }
  }

  public async shutdown(): Promise<void> {
    // Cleanup if necessary
  }
}
