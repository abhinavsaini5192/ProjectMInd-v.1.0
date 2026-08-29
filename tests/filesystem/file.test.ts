import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import { WorkspaceFileManager } from '../../src/storage/filesystem/WorkspaceFileManager';

describe('WorkspaceFileManager', () => {
  let manager: WorkspaceFileManager;
  const testRoot = path.join(__dirname, '.test_files');

  beforeEach(async () => {
    manager = new WorkspaceFileManager();
    await fs.mkdir(testRoot, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(testRoot, { recursive: true, force: true });
  });

  it('should read and write text atomically', async () => {
    const target = path.join(testRoot, 'test.txt');
    await manager.writeText(target, 'hello', true);
    
    const text = await manager.readText(target);
    expect(text).toBe('hello');
  });

  it('should read and write json atomically', async () => {
    const target = path.join(testRoot, 'test.json');
    const data = { id: 1, name: 'test' };
    await manager.writeJson(target, data, true);
    
    const readData = await manager.readJson<any>(target);
    expect(readData.name).toBe('test');
  });

  it('should check if file exists', async () => {
    const target = path.join(testRoot, 'exists.txt');
    expect(await manager.fileExists(target)).toBe(false);
    
    await manager.writeText(target, 'exist');
    expect(await manager.fileExists(target)).toBe(true);
  });
});
