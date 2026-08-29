import { IFeature } from '../models/IFeature';

export class FeatureVersionManager {
  public isModified(oldHash: string, newHash: string): boolean {
    return oldHash !== newHash;
  }
}
