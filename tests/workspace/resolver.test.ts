import { describe, it, expect, beforeEach } from 'vitest';
import { WorkspacePathResolver } from '../../src/workspace/core/WorkspacePathResolver';

describe('WorkspacePathResolver', () => {
  let resolver: WorkspacePathResolver;
  
  beforeEach(() => {
    resolver = new WorkspacePathResolver();
    // Clear relevant env vars before each test to ensure predictable OS behavior
    delete process.env.PROJECTMIND_WORKSPACE_DIR;
  });

  it('should resolve global workspace path with environment override', () => {
    process.env.PROJECTMIND_WORKSPACE_DIR = '/custom/path';
    expect(resolver.resolveGlobalWorkspacePath()).toBe('/custom/path');
  });

  it('should resolve specific repository workspace path', () => {
    process.env.PROJECTMIND_WORKSPACE_DIR = '/custom/path';
    const uuid = 'test-uuid';
    // Using string includes to avoid path separator issues in cross platform tests
    expect(resolver.resolveWorkspacePath(uuid)).toContain(uuid);
  });
});
