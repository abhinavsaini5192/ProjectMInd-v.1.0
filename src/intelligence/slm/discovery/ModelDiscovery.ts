import { ISLMProvider } from '../providers/ISLMProvider';
import { ModelRegistry } from '../registry/ModelRegistry';

export class ModelDiscovery {
  private providers: Map<string, ISLMProvider> = new Map();

  constructor(private registry: ModelRegistry) {}

  public registerProvider(providerId: string, provider: ISLMProvider): void {
    this.providers.set(providerId, provider);
  }

  public async refresh(): Promise<void> {
    for (const [providerId, provider] of this.providers.entries()) {
      try {
        const models = await provider.listModels();
        for (const model of models) {
          model.providerId = providerId;
          const existing = this.registry.getModel(model.modelId);
          if (existing) {
             this.registry.updateModel(model.modelId, model);
          } else {
             this.registry.registerModel(model);
          }
        }
      } catch (e) {
        console.warn(`[ModelDiscovery] Failed to query provider ${providerId}:`, e);
      }
    }
    
    // Invalidate models we haven't seen in the last 5 minutes
    this.registry.invalidateStaleRecords(300000);
  }
}
