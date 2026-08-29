import { IFeature } from '../models/IFeature';

export class FeatureValidator {
  public validate(features: IFeature[]): void {
    const names = new Set<string>();
    
    for (const f of features) {
      if (names.has(f.name.toLowerCase())) {
        throw new Error(`Duplicate Feature Name detected: ${f.name}`);
      }
      names.add(f.name.toLowerCase());
      
      if (f.symbolIds.length === 0) {
         // Warning rather than hard throw for empty features in some cases, but we enforce strict for now
         throw new Error(`Orphan Feature detected with zero symbols: ${f.name}`);
      }
    }
  }
}
