import { MemoryType } from './MemoryType';
import { MemorySource } from './MemorySource';
import { MemoryEvidence } from './MemoryEvidence';

export interface MemoryCandidate {
  type: MemoryType;
  content: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  importance: 'HIGH' | 'MEDIUM' | 'LOW';
  source: MemorySource;
  evidence: MemoryEvidence[];
  relatedSymbols: string[];
  relatedFeatures: string[];
  relatedTasks: string[];
}
