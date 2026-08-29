import { SLMCapabilities } from './SLMCapabilities';

export interface ModelMetadata {
  provider: string;
  modelName: string;
  modelVersion?: string;
  parameterSize?: string;
  quantization?: string;
  contextWindow: number;
  capabilities: SLMCapabilities;
  runtimeInfo?: Record<string, any>;
}
