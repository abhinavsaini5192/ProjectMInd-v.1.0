import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { ProjectMindKernel } from '../src/kernel/ProjectMindKernel';
import { SLMInferenceClient } from '../src/intelligence/slm/SLMClient';

describe('End-to-End v1.0 Release Gates', () => {
  const workspacePath = path.join(__dirname, 'test-workspace-e2e');
  let kernel: ProjectMindKernel;

  beforeEach(async () => {
    if (!fs.existsSync(workspacePath)) {
      fs.mkdirSync(workspacePath, { recursive: true });
    }
    kernel = new ProjectMindKernel(workspacePath);
  });

  afterEach(async () => {
    await kernel.shutdown();
    if (fs.existsSync(workspacePath)) {
      fs.rmSync(workspacePath, { recursive: true, force: true });
    }
  });

  it('Gate 1: Full System Boot & Health Checks', async () => {
    await expect(kernel.initialize()).resolves.not.toThrow();
    const observability = kernel.observabilityEngine;
    const health = await observability.getHealth();
    expect(health.status).toBe('healthy');
  });

  it('Gate 2: SLM Abstraction Resilience', async () => {
    const slm = new SLMInferenceClient();
    const res = await slm.generate({ prompt: 'Analyze architecture' });
    expect(res.output).toContain('[Heuristic Reply]');
    expect(res.backendUsed).toBe('heuristic');
  });

  it('Gate 3: Security & Plugin Sandbox Restrictions', () => {
    const security = kernel.securityManager;
    const isAllowed = security.validatePluginPermissions('malicious_plugin', ['fs:write:global']);
    expect(isAllowed).toBe(false);

    const safeAllowed = security.validatePluginPermissions('good_plugin', ['network:fetch']);
    expect(safeAllowed).toBe(true);

    const redacted = security.redactSecrets('DB_PASS=AKIAIOSFODNN7EXAMPLE');
    expect(redacted).toBe('DB_PASS=[REDACTED_AWS_KEY]');
  });

  it('Gate 4: Corruption Detection & Recovery Simulation', async () => {
    const recovery = kernel.recoveryManager;
    await expect(recovery.runStartupDiagnostics()).resolves.not.toThrow();
    
    // Check handles crashes gracefully without throwing raw exceptions to Node process
    expect(() => recovery.handleCrash(new Error("Simulated memory fault"))).not.toThrow();
  });
});
