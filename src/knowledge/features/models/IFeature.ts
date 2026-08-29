import { FeatureMetrics } from './FeatureMetrics';

export interface FeatureSignal {
  type: string; // 'Route', 'Dependency', 'Naming', etc.
  description: string;
  weight: number;
}

export interface IFeature {
  id: string; // Deterministic Hash of Feature Name
  name: string;
  description: string;
  confidence: number; // 0.0 to 1.0
  signals: FeatureSignal[];
  symbolIds: string[];
  relationshipIds: string[];
  dependencyIds: string[];
  routes: string[];
  configuration: string[];
  testSymbolIds: string[];
  documentationUrls: string[];
  metrics: FeatureMetrics;
  version: number;
  hash: string;
}
