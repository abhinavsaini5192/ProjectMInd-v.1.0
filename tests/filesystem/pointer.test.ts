import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import { WorkspacePointerManager } from '../../src/storage/filesystem/WorkspacePointerManager';
import { WorkspaceFileManager } from '../../src/storage/filesystem/WorkspaceFileManager';
import { WorkspaceType } from '../../src/storage/filesystem/types/FilesystemTypes';
import { PointerFileError } from '../../src/storage/filesystem/types/FilesystemErrors';

describe('WorkspacePointerManager', () => {
  let manager: WorkspacePointerManager;
  const testRoot = path.join(__dirname, '.test_pointers');

  beforeEach(async () => {
    manager = new WorkspacePointerManager(new WorkspaceFileManager());
    await fs.mkdir(testRoot, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(testRoot, { recursive: true, force: true });
  });

  it('should write and read a valid pointer', async () => {
    const pointer = {
      repositoryId: 'repo-1',
      workspaceVersion: '2.0.0',
      createdAt: new Date().toISOString(),
      workspaceType: WorkspaceType.Global
    };

    await manager.writePointer(testRoot, pointer);
    
    const read = await manager.readPointer(testRoot);
    expect(read?.repositoryId).toBe('repo-1');
  });

  it('should throw error on invalid pointer write', async () => {
    const pointer = {
      repositoryId: 123, // invalid type
      workspaceVersion: '2.0.0',
    } as any;

    await expect(manager.writePointer(testRoot, pointer)).rejects.toThrow(PointerFileError);
  });
});
