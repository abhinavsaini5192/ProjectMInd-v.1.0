import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ModelRegistry } from '../../../src/intelligence/slm/registry/ModelRegistry';
import { ModelDiscovery } from '../../../src/intelligence/slm/discovery/ModelDiscovery';
import { MockSLMProvider } from '../../../src/intelligence/slm/providers/MockSLMProvider';
import { ModelAvailability } from '../../../src/intelligence/slm/registry/ModelAvailability';

describe('Model Discovery (Phase 5.2)', () => {
  let registry: ModelRegistry;
  let discovery: ModelDiscovery;

  beforeEach(() => {
    registry = new ModelRegistry();
    discovery = new ModelDiscovery(registry);
  });

  it('should discover models from registered providers', async () => {
    const mockProvider = new MockSLMProvider();
    discovery.registerProvider('mock', mockProvider);

    await discovery.refresh();

    const models = registry.listModels();
    expect(models.length).toBe(1);
    expect(models[0].modelId).toBe('mock-mock-model');
    expect(models[0].providerId).toBe('mock');
    expect(models[0].availability).toBe(ModelAvailability.AVAILABLE);
  });

  it('should gracefully handle provider failures during discovery', async () => {
    const brokenProvider = new MockSLMProvider();
    brokenProvider.setOverrideError(new Error('Network disconnected'));
    // we need to mock listModels since setOverrideError is for generate/healthCheck
    vi.spyOn(brokenProvider, 'listModels').mockRejectedValue(new Error('Network disconnected'));

    discovery.registerProvider('broken', brokenProvider);

    await expect(discovery.refresh()).resolves.not.toThrow();
    
    expect(registry.listModels().length).toBe(0);
  });
});
