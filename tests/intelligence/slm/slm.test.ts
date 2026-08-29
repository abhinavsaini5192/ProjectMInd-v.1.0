import { describe, it, expect, beforeEach } from 'vitest';
import { SLMManager } from '../../../src/intelligence/slm/core/SLMManager';
import { MockSLMProvider } from '../../../src/intelligence/slm/providers/MockSLMProvider';
import { SLMConfig } from '../../../src/intelligence/slm/models/SLMConfig';
import { SLMConfigurationError } from '../../../src/intelligence/slm/errors/SLMConfigurationError';
import { SLMUnavailableError } from '../../../src/intelligence/slm/errors/SLMUnavailableError';
import { SLMRequest } from '../../../src/intelligence/slm/models/SLMRequest';

describe('SLM Provider & Runtime Infrastructure (Phase 5.1)', () => {
  let manager: SLMManager;

  const validConfig: SLMConfig = {
    provider: 'mock',
    model: 'mock-model',
    endpoint: 'http://localhost:8000',
    temperature: 0.1,
    contextWindow: 8192,
    maxOutputTokens: 1000,
    timeout: 1000
  };

  beforeEach(() => {
    manager = new SLMManager();
  });

  it('should initialize successfully with valid configuration', async () => {
    await expect(manager.initialize(validConfig)).resolves.not.toThrow();
    const runtime = manager.getRuntime();
    expect(runtime).toBeDefined();
  });

  it('should throw SLMConfigurationError for unsupported provider', async () => {
    const invalidConfig = { ...validConfig, provider: 'invalid_provider' as any };
    await expect(manager.initialize(invalidConfig)).rejects.toThrow(SLMConfigurationError);
  });

  it('should reject generation if context exceeds context window', async () => {
    await manager.initialize(validConfig);
    const runtime = manager.getRuntime();
    
    // 8192 tokens * 4 = 32768 characters
    const massiveInput = 'A'.repeat(35000); 

    const req: SLMRequest = {
       requestId: 'req_1',
       model: 'mock-model',
       userInput: massiveInput
    };

    await expect(runtime.generate(req)).rejects.toThrow('CONTEXT_TOO_LARGE');
  });

  it('should throw SLMUnavailableError when health check fails', async () => {
    await manager.initialize(validConfig);
    
    // Inject mock failure
    const mockProvider = (manager as any).activeProvider as MockSLMProvider;
    mockProvider.setOverrideError(new SLMUnavailableError('Mock failure', 'mock', 'mock-model'));

    await expect(manager.ensureAvailable()).rejects.toThrow(SLMUnavailableError);
  });

  it('should normalize successful response through SLMRuntime', async () => {
    await manager.initialize(validConfig);
    const runtime = manager.getRuntime();
    
    const req: SLMRequest = {
       requestId: 'req_1',
       model: 'mock-model',
       userInput: 'Fix bug'
    };

    const res = await runtime.generate(req);
    expect(res.requestId).toBe('req_1');
    expect(res.model).toBe('mock-model');
    expect(res.structuredOutput).toBeDefined();
    expect(res.structuredOutput.decisionType).toBe('MODIFY_CODE');
  });
});
