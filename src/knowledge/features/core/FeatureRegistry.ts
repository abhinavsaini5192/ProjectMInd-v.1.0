import { IFeature } from '../models/IFeature';

export class FeatureRegistry {
  private features: Map<string, IFeature> = new Map();
  private nameIndex: Map<string, string> = new Map();
  private symbolIndex: Map<string, string[]> = new Map();

  public register(feature: IFeature): void {
    this.features.set(feature.id, feature);
    this.nameIndex.set(feature.name.toLowerCase(), feature.id);

    for (const symId of feature.symbolIds) {
      if (!this.symbolIndex.has(symId)) {
        this.symbolIndex.set(symId, []);
      }
      const feats = this.symbolIndex.get(symId)!;
      if (!feats.includes(feature.id)) feats.push(feature.id);
    }
  }

  public get(id: string): IFeature | undefined {
    return this.features.get(id);
  }

  public getByName(name: string): IFeature | undefined {
    const id = this.nameIndex.get(name.toLowerCase());
    return id ? this.features.get(id) : undefined;
  }

  public getFeaturesForSymbol(symbolId: string): IFeature[] {
    const ids = this.symbolIndex.get(symbolId) || [];
    return ids.map(id => this.features.get(id)!);
  }

  public getAll(): IFeature[] {
    return Array.from(this.features.values());
  }
}
