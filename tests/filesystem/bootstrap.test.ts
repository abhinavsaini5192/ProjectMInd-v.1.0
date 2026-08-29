import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WorkspaceBootstrap } from '../../src/storage/filesystem/WorkspaceBootstrap';
import { WorkspaceFilesystem } from '../../src/storage/filesystem/WorkspaceFilesystem';
import { WorkspaceDirectoryManager } from '../../src/storage/filesystem/WorkspaceDirectoryManager';
import { WorkspaceFileManager } from '../../src/storage/filesystem/WorkspaceFileManager';
import { WorkspacePointerManager } from '../../src/storage/filesystem/WorkspacePointerManager';
import { WorkspaceTemplateManager } from '../../src/storage/filesystem/WorkspaceTemplateManager';
import { WorkspacePermissions } from '../../src/storage/filesystem/WorkspacePermissions';
import { WorkspaceLockManager } from '../../src/storage/filesystem/WorkspaceLockManager';
import { WorkspaceCleanupManager } from '../../src/storage/filesystem/WorkspaceCleanupManager';
import { NodeEventBus } from '../../src/workspace/events/NodeEventBus';
import { StructuredLogger } from '../../src/workspace/logging/StructuredLogger';
import { FilesystemEvents } from '../../src/storage/filesystem/types/FilesystemEvents';

describe('WorkspaceBootstrap', () => {
  let fs: WorkspaceFilesystem;
  let eventBus: NodeEventBus;
  let logger: StructuredLogger;

  beforeEach(() => {
    const dirMan = new WorkspaceDirectoryManager();
    const fileMan = new WorkspaceFileManager();
    vi.spyOn(dirMan, 'ensureDirectory').mockResolvedValue({ path: '', exists: true });
    vi.spyOn(dirMan, 'createStructure').mockResolvedValue();
    vi.spyOn(fileMan, 'fileExists').mockResolvedValue(false);
    vi.spyOn(fileMan, 'writeJson').mockResolvedValue();
    vi.spyOn(fileMan, 'writeText').mockResolvedValue();

    fs = new WorkspaceFilesystem(
      dirMan,
      fileMan,
      new WorkspacePointerManager(fileMan),
      new WorkspacePermissions(),
      new WorkspaceTemplateManager(),
      new WorkspaceLockManager(fileMan),
      new WorkspaceCleanupManager(dirMan, fileMan)
    );
    eventBus = new NodeEventBus();
    logger = new StructuredLogger();
    vi.spyOn(logger, 'info').mockImplementation(() => {});
  });

  it('should initialize Global Workspace', async () => {
    const spy = vi.spyOn(eventBus, 'publish');
    await WorkspaceBootstrap.initializeGlobalWorkspace(fs, eventBus, logger);
    
    expect(fs.directories.ensureDirectory).toHaveBeenCalled();
    expect(fs.directories.createStructure).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(FilesystemEvents.WorkspaceCreated, expect.any(Object));
  });

  it('should initialize Repository Workspace', async () => {
    const spy = vi.spyOn(eventBus, 'publish');
    await WorkspaceBootstrap.initializeRepositoryWorkspace(fs, 'repo-1', '/fake/repo', eventBus, logger);
    
    expect(fs.directories.ensureDirectory).toHaveBeenCalled();
    expect(fs.directories.createStructure).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(FilesystemEvents.PointerCreated, expect.any(Object));
    expect(spy).toHaveBeenCalledWith(FilesystemEvents.WorkspaceCreated, expect.any(Object));
  });
});
