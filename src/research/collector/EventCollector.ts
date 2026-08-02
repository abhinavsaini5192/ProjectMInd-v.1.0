import { EventDispatcher } from '../../events/EventDispatcher';
import { EventJournal } from './EventJournal';
import { ResearchEvent } from '../schemas/DatasetSchemas';
import * as crypto from 'crypto';

/**
 * Passive listener that observes runtime events and converts them to versioned ResearchEvents.
 */
export class EventCollector {
  private dispatcher: EventDispatcher;
  private journal: EventJournal;
  private repositoryId: string;

  constructor(dispatcher: EventDispatcher, journal: EventJournal, repositoryId: string = 'unknown_repo') {
    this.dispatcher = dispatcher;
    this.journal = journal;
    this.repositoryId = repositoryId;
  }

  public startListening(): void {
    // Subscribe to runtime events (e.g., from Kernel) without modifying them
    this.dispatcher.on('MemoryMerged', (payload: any) => this.processRuntimeEvent('MemoryMerged', payload));
    this.dispatcher.on('KnowledgeUpdated', (payload: any) => this.processRuntimeEvent('KnowledgeUpdated', payload));
  }

  private processRuntimeEvent(eventName: string, payload: any): void {
    const timestamp = Date.now();
    const eventId = crypto.randomUUID();
    
    const researchEvent: ResearchEvent = {
      eventId,
      timestamp,
      repositoryId: this.repositoryId,
      commitHash: payload?.commitHash || 'latest',
      runtimeEventName: eventName,
      schemaVersion: 'repository_event.v1',
      payload
    };

    this.journal.recordEvent(researchEvent);
  }
}
