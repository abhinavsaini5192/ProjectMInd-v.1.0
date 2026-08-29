import { SLMCapabilities } from '../models/SLMCapabilities';
import { ModelAvailability } from './ModelAvailability';

export interface ModelRecord {
  modelId: string;
  modelName: string;
  providerId: string;
  providerType: string;
  version?: string;
  capabilities: SLMCapabilities;
  contextWindow: number;
  maxOutputTokens?: number;
  availability: ModelAvailability;
  metadata?: Record<string, any>;
  lastSeen: number;
}
