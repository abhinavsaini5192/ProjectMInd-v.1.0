import { IFeature, FeatureSignal } from '../models/IFeature';
import { Feature } from '../models/Feature';
import crypto from 'crypto';

export class FeatureBuilder {
  private name!: string;
  private description: string = '';
  private confidence: number = 0;
  private signals: FeatureSignal[] = [];
  private symbolIds: string[] = [];
  private dependencyIds: string[] = [];
  private testSymbolIds: string[] = [];

  public withName(name: string): this { this.name = name; return this; }
  public withDescription(desc: string): this { this.description = desc; return this; }
  public withConfidence(conf: number): this { this.confidence = conf; return this; }
  public withSignals(signals: FeatureSignal[]): this { this.signals = signals; return this; }
  public withSymbolIds(ids: string[]): this { this.symbolIds = ids; return this; }
  public withDependencyIds(ids: string[]): this { this.dependencyIds = ids; return this; }
  public withTestSymbolIds(ids: string[]): this { this.testSymbolIds = ids; return this; }

  public build(): IFeature {
    if (!this.name) throw new Error("Feature name is required");

    const id = crypto.createHash('sha256').update(`feature:${this.name}`).digest('hex');
    
    const hashPayload = `${this.symbolIds.sort().join(',')}:${this.dependencyIds.sort().join(',')}`;
    const hash = crypto.createHash('sha256').update(hashPayload).digest('hex');

    return {
      id,
      name: this.name,
      description: this.description,
      confidence: this.confidence,
      signals: this.signals,
      symbolIds: this.symbolIds,
      relationshipIds: [],
      dependencyIds: this.dependencyIds,
      routes: [],
      configuration: [],
      testSymbolIds: this.testSymbolIds,
      documentationUrls: [],
      metrics: { size: this.symbolIds.length, complexity: 0, coupling: 0, cohesion: 0, stability: 0, health: 100, coverage: 0, volatility: 0 },
      version: 1,
      hash
    };
  }
}
