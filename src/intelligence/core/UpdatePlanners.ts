import { SemanticEvent } from '../models/SemanticEvent';
import { ImpactAnalyzer } from './ImpactAnalyzer';

export class UpdatePlanners {
  constructor(private impactAnalyzer: ImpactAnalyzer) {}

  public async planContextUpdates(events: SemanticEvent[]): Promise<string[]> {
    const impact = await this.impactAnalyzer.analyzeImpact(events);
    // Determine which context blocks need regeneration based on affected files
    return impact;
  }

  public planMemoryUpdates(events: SemanticEvent[]): string[] {
    // Determine which Memories need to be archived and rewritten
    // Returning dummy IDs for the planner
    return events.map(e => `memory_req_${e.id}`);
  }

  public planGraphUpdates(astChanges: any[]): string[] {
    // Which nodes need to be deleted/recreated in KuzuDB
    return astChanges.map(c => c.symbolName || c.filePath);
  }
}
