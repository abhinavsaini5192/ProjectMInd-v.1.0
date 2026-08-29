import { DiffEngine } from './DiffEngine';
import { ASTComparator, GenericASTNode } from './ASTComparator';
import { RepositoryScanner } from './RepositoryScanner';
import { SemanticEventEngine } from './SemanticEventEngine';
import { ArchitectureAnalyzer } from './ArchitectureAnalyzer';
import { UpdatePlanners } from './UpdatePlanners';
import { SemanticEvent } from '../models/SemanticEvent';
import { ILogger } from '../../workspace/interfaces/ILogger';

export class RepositoryIntelligenceEngine {
  constructor(
    private diffEngine: DiffEngine,
    private astComparator: ASTComparator,
    private scanner: RepositoryScanner,
    private eventEngine: SemanticEventEngine,
    private architectureAnalyzer: ArchitectureAnalyzer,
    private planners: UpdatePlanners,
    private logger: ILogger
  ) {}

  /**
   * Main entrypoint for intelligence ingestion.
   * Process a file change and emit intelligence events.
   */
  public async processChange(
    filePath: string, 
    oldContent: string, 
    newContent: string, 
    exportedSymbols: Set<string>,
    oldDeps: Record<string, string>,
    newDeps: Record<string, string>
  ): Promise<{ events: SemanticEvent[], contextUpdates: string[] }> {
    
    this.logger.info({
      component: 'RepositoryIntelligenceEngine',
      operation: 'processChange',
      message: `Analyzing changes in ${filePath}`,
      severity: 'INFO'
    });

    const oldNodes = this.scanner.scan(filePath, oldContent);
    const newNodes = this.scanner.scan(filePath, newContent);

    const astChanges = this.astComparator.compare(oldNodes, newNodes, filePath);

    const events = this.eventEngine.generateEvents(astChanges, exportedSymbols, oldDeps, newDeps);

    const archEvents = await this.architectureAnalyzer.analyze([filePath]);
    events.push(...archEvents);

    const contextUpdates = await this.planners.planContextUpdates(events);

    return { events, contextUpdates };
  }
}
