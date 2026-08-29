import { IFeature } from '../models/IFeature';

export class FeatureCache {
  private cache: Map<string, IFeature> = new Map();

  public get(id: string): IFeature | undefined { return this.cache.get(id); }
  public set(id: string, feature: IFeature): void { this.cache.set(id, feature); }
}
