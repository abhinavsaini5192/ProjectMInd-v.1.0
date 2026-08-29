import { SLMRequest } from '../models/SLMRequest';
import { SLMResponse } from '../models/SLMResponse';
import { SLMCapabilities } from '../models/SLMCapabilities';

export interface ISLMProvider {
  getCapabilities(): SLMCapabilities;
  predict(request: SLMRequest): Promise<SLMResponse>;
  isHealthy(): Promise<boolean>;
}
