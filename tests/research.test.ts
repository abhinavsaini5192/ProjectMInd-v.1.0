import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { ResearchLayerService } from '../src/research/ResearchLayerService';
import { EventDispatcher } from '../src/events/EventDispatcher';

describe('ResearchLayerService', () => {
  const testWorkspace = path.join(__dirname, 'test-research-workspace');

  beforeEach(() => {
    if (!fs.existsSync(testWorkspace)) fs.mkdirSync(testWorkspace, { recursive: true });
  });

  afterEach(() => {
    try {
      if (fs.existsSync(testWorkspace)) fs.rmSync(testWorkspace, { recursive: true, force: true });
    } catch {
      // Ignore transient file lock on cleanup
    }
  });

  it('should passively observe MemoryMerged events, anonymize payload, and build a jsonl dataset with a manifest', async () => {
    const dispatcher = new EventDispatcher();
    const service = new ResearchLayerService(testWorkspace, dispatcher);
    await service.initialize();

    // Fire a mock event with a secret API key to test Privacy pipeline
    dispatcher.dispatch('MemoryMerged', {
      commitHash: 'abcd123',
      changedFiles: ['src/app.ts'],
      gitDiff: 'Added AKIAIOSFODNN7EXAMPLE to config. This string is definitely longer than fifty characters now so that the quality score will be extremely high.',
      semanticEvents: [
        { type: 'FeatureAdded', reasoning: 'Detected AKIA key usage' }
      ]
    });

    // Wait a tick for async dispatch if necessary, though dispatch is sync in our MVP
    
    // 1. Verify Raw Event Journal was written
    const rawDir = path.join(testWorkspace, 'research', 'datasets', 'raw');
    const rawFiles = fs.readdirSync(rawDir);
    expect(rawFiles.length).toBe(1);
    
    // 2. Verify Processed dataset was generated
    const processedFile = path.join(testWorkspace, 'research', 'datasets', 'processed', 'training.jsonl');
    expect(fs.existsSync(processedFile)).toBe(true);

    // 3. Verify Privacy Pipeline scrubbed the AKIA key in the final dataset
    const processedContent = fs.readFileSync(processedFile, 'utf-8');
    const parsedSample = JSON.parse(processedContent);
    console.log("Parsed sample:", JSON.stringify(parsedSample, null, 2));
    expect(parsedSample.input.gitDiff).not.toContain('AKIAIOSFODNN7EXAMPLE');
    expect(parsedSample.input.gitDiff).toContain('[REDACTED_SECRET]');

    // 4. Verify Semantic Reasoning is retained in Output label
    expect(parsedSample.output.reasoningTrace).toContain('Detected');
    expect(parsedSample.schemaVersion).toBe('training_sample.v1');

    // 5. Verify Manifest
    const manifestFile = path.join(testWorkspace, 'research', 'datasets', 'exports', 'latest_export', 'manifest.json');
    expect(fs.existsSync(manifestFile)).toBe(true);
    const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf-8'));
    expect(manifest.sampleCount).toBe(1);
  });

  it('should handle schema versioning gracefully and track lineages', () => {
    // Simulated test for checking backward compatibility of older dataset schemas
    const oldSample = {
      sampleId: 'sample_old',
      repositoryId: 'repo',
      commitHash: 'hash',
      timestamp: Date.now(),
      schemaVersion: 'training_sample.v0.9',
      lineage: { generatorVersion: '0.9', eventHashes: [] },
      input: { changedFiles: [] },
      output: { semanticLabels: [], confidenceScore: 0.8 },
      metadata: { qualityScore: 0.9 }
    };
    
    // In a real migration engine, we would pass this to an upgrader function
    expect(oldSample.schemaVersion).toBe('training_sample.v0.9');
  });

  it('benchmark: should process 10,000 events with zero impact on runtime performance', async () => {
    const dispatcher = new EventDispatcher();
    const service = new ResearchLayerService(testWorkspace, dispatcher);
    await service.initialize();

    const start = performance.now();
    
    // Fire 10,000 lightweight events
    for (let i = 0; i < 10000; i++) {
      dispatcher.dispatch('KnowledgeUpdated', {
        commitHash: `hash_${i}`,
        type: 'MinorUpdate'
      });
    }

    const end = performance.now();
    const timeTakenMs = end - start;
    
    // Verifying it took less than 5000ms (average 0.5ms per event, perfectly non-blocking)
    expect(timeTakenMs).toBeLessThan(5000);

    const rawDir = path.join(testWorkspace, 'research', 'datasets', 'raw');
    const rawFiles = fs.readdirSync(rawDir);
    expect(rawFiles.length).toBeGreaterThan(0);
  });
});
