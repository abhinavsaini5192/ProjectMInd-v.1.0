import { FeatureRegistry } from './FeatureRegistry';
import { IFeature } from '../models/IFeature';

export class FeatureResolver {
  constructor(private registry: FeatureRegistry) {}

  public findFeature(name: string): IFeature | undefined {
    return this.registry.getByName(name);
  }

  public findFeatureSymbols(name: string): string[] {
    const f = this.registry.getByName(name);
    return f ? f.symbolIds : [];
  }

  public findFeatureDependencies(name: string): string[] {
    const f = this.registry.getByName(name);
    return f ? f.dependencyIds : [];
  }
}
