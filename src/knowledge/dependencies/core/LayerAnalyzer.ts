import { LayerResolutionStrategy } from './LayerResolutionStrategy';
import { Layer } from '../models/Layer';

export class LayerAnalyzer {
  private strategies: LayerResolutionStrategy[] = [];
  private definedLayers: Map<string, Layer> = new Map();

  public registerStrategy(strategy: LayerResolutionStrategy): void {
    this.strategies.push(strategy);
  }

  public registerLayer(layer: Layer): void {
    this.definedLayers.set(layer.name, layer);
  }

  public resolveLayer(symbolId: string): Layer | undefined {
    for (const strategy of this.strategies) {
      const layerName = strategy.resolve(symbolId);
      if (layerName && this.definedLayers.has(layerName)) {
        return this.definedLayers.get(layerName);
      }
    }
    return undefined;
  }
}
