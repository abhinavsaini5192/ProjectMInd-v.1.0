import { IFeature, FeatureSignal } from './IFeature';
import { FeatureMetrics } from './FeatureMetrics';

export class Feature implements IFeature {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public confidence: number,
    public signals: FeatureSignal[],
    public symbolIds: string[],
    public relationshipIds: string[],
    public dependencyIds: string[],
    public routes: string[],
    public configuration: string[],
    public testSymbolIds: string[],
    public documentationUrls: string[],
    public metrics: FeatureMetrics,
    public version: number,
    public hash: string
  ) {}
}
