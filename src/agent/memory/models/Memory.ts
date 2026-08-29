import { MemoryType } from './MemoryType';
import { MemorySource } from './MemorySource';
import { MemoryEvidence } from './MemoryEvidence';

export enum MemoryStatus {
  ACTIVE = 'ACTIVE',
  SUPERSEDED = 'SUPERSEDED',
  CONTRADICTED = 'CONTRADICTED',
  INVALIDATED = 'INVALIDATED',
  ARCHIVED = 'ARCHIVED'
}

export interface Memory {
  memoryId: string;
  repositoryId: string;
  workspaceId: string;
  type: MemoryType;
  content: string;
  status: MemoryStatus;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  importance: 'HIGH' | 'MEDIUM' | 'LOW';
  createdAt: number;
  updatedAt: number;
  lastConfirmedAt: number;
  observationCount: number;
  source: MemorySource;
  evidence: MemoryEvidence[];
  relatedSymbols: string[];
  relatedFeatures: string[];
  relatedTasks: string[];
  supersedes?: string[];
  supersededBy?: string;
}
