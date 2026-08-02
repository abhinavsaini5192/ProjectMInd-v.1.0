import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { ProjectMindKernel } from '../src/kernel/ProjectMindKernel';
import { Service } from '../src/interfaces';

describe('ProjectMindKernel Integration', () => {
  const testWorkspace = path.join(__dirname, 'test-workspace');

  beforeEach(() => {
    if (!fs.existsSync(testWorkspace)) {
      fs.mkdirSync(testWorkspace, { recursive: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(testWorkspace)) {
      fs.rmSync(testWorkspace, { recursive: true, force: true });
    }
  });

  it('should initialize successfully', async () => {
    const kernel = new ProjectMindKernel(testWorkspace);
    
    const initSpy = vi.fn();
    kernel.eventDispatcher.on('KernelInitialized', initSpy);

    await kernel.initialize();

    // Workspace should exist
    expect(fs.existsSync(path.join(testWorkspace, '.projectmind'))).toBe(true);
    // State should be created
    expect(fs.existsSync(path.join(testWorkspace, '.projectmind', 'state.json'))).toBe(true);
    // Event dispatched
    expect(initSpy).toHaveBeenCalled();
  });

  it('should register and initialize services', async () => {
    const kernel = new ProjectMindKernel(testWorkspace);
    
    const mockService: Service = {
      name: 'mock-service',
      initialize: vi.fn().mockResolvedValue(undefined),
      shutdown: vi.fn().mockResolvedValue(undefined)
    };

    kernel.registerService(mockService);
    
    expect(kernel.serviceRegistry.getService('mock-service')).toBeDefined();

    await kernel.initialize();

    expect(mockService.initialize).toHaveBeenCalled();

    await kernel.shutdown();

    expect(mockService.shutdown).toHaveBeenCalled();
  });
  
  it('should load default configuration', () => {
     const kernel = new ProjectMindKernel(testWorkspace);
     const config = kernel.configManager.getConfig();
     expect(config.debug).toBe(false);
     expect(config.maxHistorySizeMB).toBe(5);
  });
});
