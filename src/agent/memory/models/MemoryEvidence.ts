import { MemorySource } from './MemorySource';

export interface MemoryEvidence {
  source: MemorySource;
  taskId?: string;
  files?: string[];
  verificationId?: string;
  recoveryId?: string;
  description: string;
}
