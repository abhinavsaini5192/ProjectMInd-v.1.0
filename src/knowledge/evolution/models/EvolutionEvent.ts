import { ChangeClassification } from '../types/EvolutionTypes';
import { ChangeImpact } from './ChangeImpact';

export interface EvolutionEvent {
  id: string; // Hash of commitHash + timestamp
  commitHash: string;
  timestamp: number;
  classifications: ChangeClassification[];
  impact: ChangeImpact;
  description: string;
}
