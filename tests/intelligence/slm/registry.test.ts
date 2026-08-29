import { describe, it, expect, beforeEach } from 'vitest';
import { ModelRegistry } from '../../../src/intelligence/slm/registry/ModelRegistry';
import { ModelAvailability } from '../../../src/intelligence/slm/registry/ModelAvailability';

describe('Model Registry (Phase 5.2)', () => {
  let registry: ModelRegistry;

  const sampleModel = {
    modelId: 'test-model',
    modelName: 'test',
    providerId: 'local',
    providerType: 'local',
    capabilities: {
      contextWindow: 8000,
      supportsStreaming: false,
      supportsStructuredOutput: true,
      supportsToolCalling: false,
      supportsEmbeddings: false,
      supportsVision: false,
      supportsSystemPrompt: true
    },
    contextWindow: 8000,
    availability: ModelAvailability.AVAILABLE,
    lastSeen: Date.now()
  };

  beforeEach(() => {
    registry = new ModelRegistry();
  });

  it('should register and retrieve a model', () => {
    registry.registerModel(sampleModel);
    
    const retrieved = registry.getModel('test-model');
    expect(retrieved).toBeDefined();
    expect(retrieved?.availability).toBe(ModelAvailability.AVAILABLE);
  });

  it('should invalidate stale models', () => {
    registry.registerModel({ ...sampleModel, lastSeen: Date.now() - 400000 }); // Over 5 mins ago

    registry.invalidateStaleRecords();

    const retrieved = registry.getModel('test-model');
    expect(retrieved?.availability).toBe(ModelAvailability.UNAVAILABLE);
  });

  it('should filter available models', () => {
    registry.registerModel(sampleModel);
    registry.registerModel({ ...sampleModel, modelId: 'test2', availability: ModelAvailability.UNAVAILABLE });

    const available = registry.findAvailableModels();
    expect(available.length).toBe(1);
    expect(available[0].modelId).toBe('test-model');
  });
});
