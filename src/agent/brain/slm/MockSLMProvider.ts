import { ISLMProvider, SLMRequest, SLMResponse } from './ISLMProvider';
import { DecisionType } from '../models/BrainDecision';

export class MockSLMProvider implements ISLMProvider {
  private overrideResponse: Partial<SLMResponse> | null = null;

  public setOverride(response: Partial<SLMResponse>) {
    this.overrideResponse = response;
  }

  async generate(request: SLMRequest): Promise<SLMResponse> {
    if (this.overrideResponse) {
       return {
          decision: { ...this.overrideResponse.decision },
          rawOutput: this.overrideResponse.rawOutput || '{}',
          tokenUsage: this.overrideResponse.tokenUsage || 100
       };
    }

    // Default successful behavior for testing
    return {
      decision: {
        decisionType: DecisionType.MODIFY_CODE,
        confidence: 0.95,
        reasoningSummary: 'Mock reasoning: Code needs to be updated based on context.',
        targets: ['src/auth/AuthService.ts'],
        actions: [{ type: 'ADD_FEATURE' }],
        constraints: ['Keep backwards compatibility'],
        requiredVerification: ['TEST'],
        evidence: ['sym_123']
      },
      rawOutput: '{"mock": true}',
      tokenUsage: 150
    };
  }
}
