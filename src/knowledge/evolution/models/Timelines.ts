import { EvolutionEvent } from './EvolutionEvent';

export interface RepositoryTimeline {
  events: EvolutionEvent[];
  lastCommitHash: string;
  totalCommitsAnalyzed: number;
}

export interface FeatureEvolution {
  featureId: string;
  history: EvolutionEvent[];
  lifecycleState: 'Created' | 'Expanded' | 'Refactored' | 'Split' | 'Merged' | 'Deprecated' | 'Removed';
}

export interface ArchitectureEvolution {
  layerId: string;
  history: EvolutionEvent[];
}

export interface DependencyEvolution {
  dependencyId: string;
  history: EvolutionEvent[];
}
