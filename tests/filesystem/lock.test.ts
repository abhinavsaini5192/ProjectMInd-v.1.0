import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import { WorkspaceLockManager } from '../../src/storage/filesystem/WorkspaceLockManager';
import { WorkspaceFileManager } from '../../src/storage/filesystem/WorkspaceFileManager';
import { LockType } from '../../src/storage/filesystem/types/FilesystemTypes';
import { LockTimeoutError } from '../../src/storage/filesystem/types/FilesystemErrors';

describe('WorkspaceLockManager', () => {
  let manager: WorkspaceLockManager;
  let fileManager: WorkspaceFileManager;
  const testRoot = path.join(__dirname, '.test_locks');

  beforeEach(async () => {
    fileManager = new WorkspaceFileManager();
    manager = new WorkspaceLockManager(fileManager);
    await fs.mkdir(testRoot, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(testRoot, { recursive: true, force: true });
  });

  it('should acquire lock successfully', async () => {
    const lock = await manager.acquireLock(testRoot, LockType.Write);
    expect(lock.type).toBe(LockType.Write);
    expect(lock.pid).toBe(process.pid);
  });

  it('should release lock successfully', async () => {
    const lock = await manager.acquireLock(testRoot, LockType.Write);
    await manager.releaseLock(testRoot, lock.id);
    
    expect(await fileManager.fileExists(path.join(testRoot, '.lock'))).toBe(false);
  });

  it('should prevent acquiring active lock', async () => {
    await manager.acquireLock(testRoot, LockType.Write);
    await expect(manager.acquireLock(testRoot, LockType.Read)).rejects.toThrow(LockTimeoutError);
  });
});
