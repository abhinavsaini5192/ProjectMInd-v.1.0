import { describe, it, expect, beforeEach } from 'vitest';
import { SLMGateway } from '../../../src/intelligence/slm/core/SLMGateway';
import { SLMOutputValidator } from '../../../src/intelligence/slm/core/SLMOutputValidator';
import { SLMFallbackManager } from '../../../src/intelligence/slm/core/SLMFallbackManager';
import { MockSLMProvider } from '../../../src/intelligence/slm/providers/MockSLMProvider';
import { KernelEventDispatcher } from '../../../src/kernel/core/KernelEventDispatcher';
import { SLMRequest } from '../../../src/intelligence/slm/models/SLMRequest';
import { SLMTaskType } from '../../../src/intelligence/slm/models/SLMTaskType';

describe('SLM Interface & Model Runtime Layer (L3.5)', () => {
  let gateway: SLMGateway;
  let provider: MockSLMProvider;
  let validator: SLMOutputValidator;
  let knownEntities: Set<string>;

  beforeEach(() => {
    knownEntities = new Set(['feat_auth', 'feat_db', 'AuthService', 'JWTService']);
    provider = new MockSLMProvider();
    validator = new SLMOutputValidator(knownEntities);
    const fallbackManager = new SLMFallbackManager(new KernelEventDispatcher());
    
    gateway = new SLMGateway(provider, validator, fallbackManager);
  });

  const mockRequest: SLMRequest = {
    requestId: 'req_123',
    taskType: SLMTaskType.FEATURE_INTERPRETATION,
    promptVersion: 'feature-interpretation.v1',
    taskDescription: 'Fix auth bug',
    intentType: 'BUG_FIX',
    repositoryId: 'repo_1',
    snapshotId: 'snap_1',
    candidateFeatures: ['feat_auth'],
    candidateEntities: ['AuthService', 'JWTService'],
    maxTokens: 500,
    temperature: 0.1
  };

  it('should successfully request an SLM prediction and validate schema', async () => {
    const prediction = await gateway.getPrediction(mockRequest);
    
    expect(prediction.intent).toBe('BUG_FIX');
    expect(prediction.relevantFeatures).toContain('feat_auth');
    expect(prediction.recommendedContext).toContain('AuthService');
  });

  it('should reject hallucinations and trigger deterministic fallback', async () => {
    // Tell mock to hallucinate an entity not in knownEntities
    provider.hallucinate = true;
    
    const prediction = await gateway.getPrediction(mockRequest);
    
    // Gateway catches HALLUCINATION error in validator and returns fallback
    expect(prediction.reasoningSummary).toContain('Deterministic fallback activated');
    expect(prediction.confidence).toBe(0.1); // Fallback confidence
  });

  it('should trigger fallback if the provider fails (e.g. timeout)', async () => {
    provider.shouldFail = true;

    const prediction = await gateway.getPrediction(mockRequest);
    
    // Fallback hit
    expect(prediction.reasoningSummary).toContain('Deterministic fallback activated');
    expect(prediction.confidence).toBe(0.1);
  });

  it('should fallback if capability is mismatched', async () => {
    const badRequest = { ...mockRequest, taskType: 'UNKNOWN_TASK' as SLMTaskType };
    
    const prediction = await gateway.getPrediction(badRequest);
    
    expect(prediction.reasoningSummary).toContain('Deterministic fallback activated');
  });
});
