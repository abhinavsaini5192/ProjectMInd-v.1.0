import * as fs from 'fs';
import * as path from 'path';
import { ResearchEvent } from '../schemas/DatasetSchemas';
import { DatasetManager } from '../storage/DatasetManager';

/**
 * Stores events in an append-only journal organized by date.
 */
export class EventJournal {
  private datasetManager: DatasetManager;

  constructor(datasetManager: DatasetManager) {
    this.datasetManager = datasetManager;
  }

  public recordEvent(event: ResearchEvent): void {
    const rawDir = this.datasetManager.getDirectory('raw');
    
    // YYYY-MM-DD
    const dateStr = new Date(event.timestamp).toISOString().split('T')[0];
    const journalPath = path.join(rawDir, `journal_${dateStr}.jsonl`);

    fs.appendFileSync(journalPath, JSON.stringify(event) + '\n', 'utf-8');
  }
}
