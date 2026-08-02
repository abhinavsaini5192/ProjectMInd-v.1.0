import { ResearchEvent, TrainingSample } from '../schemas/DatasetSchemas';
import { PrivacyPipeline } from '../privacy/PrivacyPipeline';
import * as crypto from 'crypto';

export class SampleBuilder {
  private privacyPipeline: PrivacyPipeline;

  constructor(privacyPipeline: PrivacyPipeline) {
    this.privacyPipeline = privacyPipeline;
  }

  /**
   * Deterministically builds a TrainingSample from a raw ResearchEvent.
   */
  public buildFromEvent(event: ResearchEvent): TrainingSample | null {
    // We only build samples from semantic updates for supervised learning
    if (event.runtimeEventName !== 'MemoryMerged') return null;

    console.log('event.payload in builder:', event.payload);

    // Phase 1 EventDispatcher wraps payloads in { type, timestamp, payload }
    const actualPayload = event.payload?.payload || event.payload || {};

    const payloadStr = JSON.stringify(actualPayload);
    const safePayload = JSON.parse(this.privacyPipeline.applyPrivacyFilters(payloadStr));
    
    // Stable ID generation based on event payload
    const eventHash = crypto.createHash('sha256').update(JSON.stringify(event)).digest('hex');
    const sampleId = `sample_${eventHash.substring(0, 12)}`;

    // Generate Labels (Simulated mapping from Intelligence payload)
    const semanticLabels = safePayload.semanticEvents?.map((e: any) => e.type) || [];
    const reasoningTrace = safePayload.semanticEvents?.map((e: any) => e.reasoning).join(' | ') || '';

    const sample: TrainingSample = {
      sampleId,
      repositoryId: event.repositoryId,
      commitHash: event.commitHash,
      timestamp: event.timestamp,
      schemaVersion: 'training_sample.v1',
      lineage: {
        generatorVersion: '1.0.0',
        eventHashes: [eventHash]
      },
      input: {
        changedFiles: safePayload.changedFiles || [],
        gitDiff: safePayload.gitDiff
      },
      output: {
        semanticLabels,
        confidenceScore: 0.95,
        reasoningTrace 
      },
      metadata: {
        qualityScore: this.scoreQuality(semanticLabels, safePayload)
      }
    };

    return sample;
  }

  private scoreQuality(labels: string[], payload: any): number {
    let score = 0.5;
    if (labels.length > 0) score += 0.3;
    if (payload.gitDiff && payload.gitDiff.length > 50) score += 0.2;
    return score;
  }
}
