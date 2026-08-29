import { BrainDecision } from '../models/BrainDecision';

export interface SLMRequest {
  taskId: string;
  taskIntent: string;
  context: any;
  budgetUsed: number;
}

export interface SLMResponse {
  decision: Partial<BrainDecision>; // Partial because the engine needs to assign IDs and enrich
  rawOutput: string;
  tokenUsage: number;
}

export interface ISLMProvider {
  generate(request: SLMRequest): Promise<SLMResponse>;
}
