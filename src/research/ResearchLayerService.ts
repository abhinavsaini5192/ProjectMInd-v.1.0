import * as fs from 'fs';
import * as path from 'path';
import { Service } from '../interfaces';
import { EventDispatcher } from '../events/EventDispatcher';
import { DatasetManager } from './storage/DatasetManager';
import { EventJournal } from './collector/EventJournal';
import { EventCollector } from './collector/EventCollector';
import { SampleBuilder } from './builder/SampleBuilder';
import { PrivacyPipeline } from './privacy/PrivacyPipeline';
import { DatasetValidator } from './validators/DatasetValidator';
import { DatasetAnalytics } from './analytics/DatasetAnalytics';
import { TrainingSample } from './schemas/DatasetSchemas';

/**
 * The Facade for the Phase 5.1 Research Layer.
 */
export class ResearchLayerService implements Service {
  public readonly name = 'research-layer';
  
  private datasetManager: DatasetManager;
  private journal: EventJournal;
  private collector: EventCollector;
  private builder: SampleBuilder;
  private privacy: PrivacyPipeline;
  private validator: DatasetValidator;
  private analytics: DatasetAnalytics;
  private dispatcher: EventDispatcher;

  constructor(workspacePath: string, dispatcher: EventDispatcher) {
    this.dispatcher = dispatcher;
    this.datasetManager = new DatasetManager(workspacePath);
    this.journal = new EventJournal(this.datasetManager);
    this.collector = new EventCollector(dispatcher, this.journal, 'repo_test');
    
    this.privacy = new PrivacyPipeline();
    this.builder = new SampleBuilder(this.privacy);
    this.validator = new DatasetValidator();
    this.analytics = new DatasetAnalytics();
  }

  public async initialize(): Promise<void> {
    this.collector.startListening();
    
    // We also intercept the 'MemoryMerged' event to trigger sample building pipeline directly for the MVP
    this.dispatcher.on('MemoryMerged', (payload: any) => this.generateDatasetOnFly(payload));
  }

  public async shutdown(): Promise<void> {
    // Write manifest of all processed samples on shutdown
  }

  private generateDatasetOnFly(payload: any): void {
    const mockEvent = {
      eventId: 'evt_1',
      timestamp: Date.now(),
      repositoryId: 'repo_1',
      commitHash: 'hash',
      runtimeEventName: 'MemoryMerged',
      schemaVersion: 'repository_event.v1' as const,
      payload
    };

    const sample = this.builder.buildFromEvent(mockEvent);
    if (!sample) return;

    const validation = this.validator.validate(sample);
    if (validation.valid) {
      this.exportSample(sample);
    } else {
      console.warn('Research Layer rejected sample:', validation.errors);
    }
  }

  private exportSample(sample: TrainingSample): void {
    const processedDir = this.datasetManager.getDirectory('processed');
    const targetFile = path.join(processedDir, 'training.jsonl');
    
    fs.appendFileSync(targetFile, JSON.stringify(sample) + '\n', 'utf-8');

    // Update manifest logic
    const manifest = this.analytics.generateManifest([sample]);
    this.datasetManager.writeManifest('latest_export', manifest);
  }
}
