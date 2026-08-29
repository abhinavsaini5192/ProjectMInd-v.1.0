import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import { WorkspaceDirectoryManager } from '../../src/storage/filesystem/WorkspaceDirectoryManager';

describe('WorkspaceDirectoryManager', () => {
  let manager: WorkspaceDirectoryManager;
  const testRoot = path.join(__dirname, '.test_dirs');

  beforeEach(async () => {
    manager = new WorkspaceDirectoryManager();
    await fs.mkdir(testRoot, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(testRoot, { recursive: true, force: true });
  });

  it('should ensure directory exists', async () => {
    const target = path.join(testRoot, 'new_dir');
    const dir = await manager.ensureDirectory(target);
    expect(dir.exists).toBe(true);
    
    const stat = await fs.stat(target);
    expect(stat.isDirectory()).toBe(true);
  });

  it('should create layout structure', async () => {
    const layout = ['meta', 'logs', 'cache'];
    await manager.createStructure(testRoot, layout);

    for (const folder of layout) {
      const stat = await fs.stat(path.join(testRoot, folder));
      expect(stat.isDirectory()).toBe(true);
    }
  });

  it('should calculate directory size', async () => {
    const dir = path.join(testRoot, 'size_test');
    await manager.ensureDirectory(dir);
    await fs.writeFile(path.join(dir, 'test.txt'), '12345'); // 5 bytes
    
    const size = await manager.calculateSize(dir);
    expect(size).toBe(5);
  });
});
