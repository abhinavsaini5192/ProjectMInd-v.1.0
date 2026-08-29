import { LockType } from '../types/FilesystemTypes';

export interface WorkspaceLock {
  id: string;
  type: LockType;
  pid: number;
  acquiredAt: string;
  expiresAt: string;
}
