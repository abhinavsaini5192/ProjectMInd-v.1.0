import { describe, it, expect, beforeEach } from 'vitest';
import { ModelRegistry } from '../../../src/intelligence/slm/registry/ModelRegistry';
import { ModelAvailability } from '../../../src/intelligence/slm/registry/ModelAvailability';
import { ModelSelector } from '../../../src/intelligence/slm/selection/ModelSelector';
import { NoCompatibleModelError } from '../../../src/intelligence/slm/selection/NoCompatibleModelError';

describe('Model Selection & Capability Matching (Phase 5.2)', () => {
  let registry: ModelRegistry;
  let selector: ModelSelector;

  beforeEach(() => {
    registry = new ModelRegistry();
    selector = new ModelSelector(registry);

    registry.registerModel({
      modelId: 'weak-model',
      modelName: 'weak',
      providerId: 'local',
      providerType: 'local',
      capabilities: {
        contextWindow: 4000,
        supportsStreaming: false,
        supportsStructuredOutput: false,
        supportsToolCalling: false,
        supportsEmbeddings: false,
        supportsVision: false,
        supportsSystemPrompt: true
      },
      contextWindow: 4000,
      availability: ModelAvailability.AVAILABLE,
      lastSeen: Date.now()
    });

    registry.registerModel({
      modelId: 'strong-model',
      modelName: 'strong',
      providerId: 'local',
      providerType: 'local',
      capabilities: {
        contextWindow: 32000,
        supportsStreaming: true,
        supportsStructuredOutput: true,
        supportsToolCalling: true,
        supportsEmbeddings: false,
        supportsVision: false,
        supportsSystemPrompt: true
      },
      contextWindow: 32000,
      availability: ModelAvailability.AVAILABLE,
      lastSeen: Date.now()
    });
  });

  it('should select strong model when structured output is required', () => {
    const result = selector.selectModel({ requiresStructuredOutput: true });
    
    expect(result.selectedModel.modelId).toBe('strong-model');
    expect(result.rejectedModels.length).toBe(1);
    expect(result.rejectedModels[0].modelId).toBe('weak-model');
    expect(result.rejectedModels[0].reason).toContain('Structured output is required');
  });

  it('should select strong model when large context is required', () => {
    const result = selector.selectModel({ minimumContextWindow: 16000 });
    
    expect(result.selectedModel.modelId).toBe('strong-model');
    expect(result.rejectedModels.length).toBe(1);
    expect(result.rejectedModels[0].modelId).toBe('weak-model');
    expect(result.rejectedModels[0].reason).toContain('Context window too small');
  });

  it('should throw NoCompatibleModelError when no model matches', () => {
    expect(() => {
      selector.selectModel({ minimumContextWindow: 100000 });
    }).toThrow(NoCompatibleModelError);
  });

  it('should respect strict preferred model selection', () => {
    const result = selector.selectModel({
      strictModelSelection: true,
      preferredModelId: 'weak-model'
    });

    expect(result.selectedModel.modelId).toBe('weak-model');
    expect(result.rejectedModels.length).toBe(1);
    expect(result.rejectedModels[0].modelId).toBe('strong-model');
  });
});
