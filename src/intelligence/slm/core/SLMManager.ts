import { ISLMProvider } from '../providers/ISLMProvider';
import { LocalHTTPProvider } from '../providers/LocalHTTPProvider';
import { OllamaProvider } from '../providers/OllamaProvider';
import { OpenAICompatibleProvider } from '../providers/OpenAICompatibleProvider';
import { MockSLMProvider } from '../providers/MockSLMProvider';
import { SLMConfig } from '../models/SLMConfig';
import { SLMConfigurationError } from '../errors/SLMConfigurationError';
import { SLMRuntime } from './SLMRuntime';
import { SLMHealthMonitor, HealthState } from './SLMHealthMonitor';
import { SLMUnavailableError } from '../errors/SLMUnavailableError';

export class SLMManager {
  private activeProvider: ISLMProvider | null = null;
  private runtime: SLMRuntime | null = null;
  private healthMonitor = new SLMHealthMonitor();

  public async initialize(config: SLMConfig): Promise<void> {
    switch (config.provider) {
      case 'local':
        this.activeProvider = new LocalHTTPProvider(config);
        break;
      case 'ollama':
        this.activeProvider = new OllamaProvider(config);
        break;
      case 'openai':
        this.activeProvider = new OpenAICompatibleProvider(config);
        break;
      case 'mock':
        this.activeProvider = new MockSLMProvider();
        break;
      default:
        throw new SLMConfigurationError(`Unsupported provider: ${config.provider}`);
    }

    this.runtime = new SLMRuntime(this.activeProvider, config);
    await this.healthMonitor.checkHealth(this.activeProvider);
  }

  public getRuntime(): SLMRuntime {
    if (!this.runtime) {
      throw new SLMConfigurationError('SLMManager not initialized');
    }
    return this.runtime;
  }

  public async ensureAvailable(): Promise<void> {
    if (!this.activeProvider) throw new SLMConfigurationError('No active provider');
    const state = await this.healthMonitor.checkHealth(this.activeProvider);
    if (state === HealthState.UNAVAILABLE) {
       throw new SLMUnavailableError('Provider failed health check', 'manager', 'unknown');
    }
  }
}
