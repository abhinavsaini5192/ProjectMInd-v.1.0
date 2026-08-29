import { ModelRecord } from '../registry/ModelRecord';

export interface ModelScore {
  capabilityScore: number;
  contextScore: number;
  performanceScore: number;
  reliabilityScore: number;
  localityScore: number;
  preferenceScore: number;
  totalScore: number;
}

export interface RejectedModel {
  modelId: string;
  reason: string;
}

export interface ModelSelectionResult {
  selectedModel: ModelRecord;
  selectedProviderId: string;
  score: ModelScore;
  matchedRequirements: string[];
  rejectedModels: RejectedModel[];
  selectionReason: string;
}
