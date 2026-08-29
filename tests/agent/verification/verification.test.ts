import { describe, it, expect, beforeEach } from 'vitest';
import { VerificationEngine } from '../../../src/agent/verification/core/VerificationEngine';
import { VerificationPlanner } from '../../../src/agent/verification/core/VerificationPlanner';
import { VerificationConfidence } from '../../../src/agent/verification/core/VerificationConfidence';
import { SnapshotManager } from '../../../src/agent/verification/state/RepositorySnapshot';
import { OverallStatus } from '../../../src/agent/verification/models/VerificationResult';
import { KernelEventDispatcher } from '../../../src/kernel/core/KernelEventDispatcher';
import { CheckResult, CheckStatus } from '../../../src/agent/verification/models/CheckResult';

describe('Verification & Validation Engine (Phase 4.7)', () => {
  let engine: VerificationEngine;
  let snapshotManager: SnapshotManager;

  beforeEach(() => {
    engine = new VerificationEngine(
      new VerificationPlanner(),
      new VerificationConfidence(),
      new KernelEventDispatcher()
    );
    snapshotManager = new SnapshotManager();
  });

  it('should verify successfully when expected files match exactly', async () => {
    const before = snapshotManager.createSnapshot(['A.ts', 'B.ts']);
    const after = snapshotManager.createSnapshot(['A.ts', 'B.ts']);
    // Mock the hashes so A.ts actually changed
    before.files.get('A.ts')!.hash = 'old_hash';
    after.files.get('A.ts')!.hash = 'new_hash';
    // B.ts didn't change and wasn't expected to
    
    const result = await engine.verify(before, after, ['A.ts'], []);
    
    expect(result.overallStatus).toBe(OverallStatus.VERIFIED);
    expect(result.unexpectedChanges.length).toBe(0);
    expect(result.missingChanges.length).toBe(0);
  });

  it('should fail FileCheck if an expected file was NOT modified', async () => {
    const before = snapshotManager.createSnapshot(['A.ts']);
    const after = snapshotManager.createSnapshot(['A.ts']);
    // Hashes remain identical
    before.files.get('A.ts')!.hash = 'same_hash';
    after.files.get('A.ts')!.hash = 'same_hash';

    const result = await engine.verify(before, after, ['A.ts'], []);

    expect(result.overallStatus).toBe(OverallStatus.FAILED);
    expect(result.missingChanges).toContain('A.ts');
    
    const fileCheck = result.checks.find(c => c.type === 'FILE');
    expect(fileCheck!.status).toBe(CheckStatus.FAIL);
  });

  it('should report unexpected files but not hard-fail if only unexpected changes exist', async () => {
    const before = snapshotManager.createSnapshot(['A.ts', 'B.ts']);
    const after = snapshotManager.createSnapshot(['A.ts', 'B.ts']);
    
    // A changed as expected
    before.files.get('A.ts')!.hash = 'old_a';
    after.files.get('A.ts')!.hash = 'new_a';
    
    // B changed unexpectedly!
    before.files.get('B.ts')!.hash = 'old_b';
    after.files.get('B.ts')!.hash = 'new_b';

    const result = await engine.verify(before, after, ['A.ts'], []);

    expect(result.overallStatus).toBe(OverallStatus.PARTIALLY_VERIFIED);
    expect(result.unexpectedChanges).toContain('B.ts');
  });

  it('should detect syntax errors in modified files', async () => {
    const before = snapshotManager.createSnapshot(['bad_syntax.ts']);
    const after = snapshotManager.createSnapshot(['bad_syntax.ts']);
    before.files.get('bad_syntax.ts')!.hash = 'old';
    after.files.get('bad_syntax.ts')!.hash = 'new';

    const result = await engine.verify(before, after, ['bad_syntax.ts'], []);

    expect(result.overallStatus).toBe(OverallStatus.FAILED);
    const syntaxCheck = result.checks.find(c => c.type === 'SYNTAX');
    expect(syntaxCheck!.status).toBe(CheckStatus.FAIL);
    expect(syntaxCheck!.evidence[0].type).toBe('SYNTAX_ERROR');
  });

  it('should schedule TYPE and TEST checks if PUBLIC_API impact flag is passed', async () => {
    const before = snapshotManager.createSnapshot(['A.txt']);
    const after = snapshotManager.createSnapshot(['A.txt']);
    before.files.get('A.txt')!.hash = 'old';
    after.files.get('A.txt')!.hash = 'new';

    const result = await engine.verify(before, after, ['A.txt'], ['PUBLIC_API']);
    
    const checkTypes = result.checks.map(c => c.type);
    expect(checkTypes).toContain('TYPE');
    expect(checkTypes).toContain('TEST');
  });

  it('confidence calculator should cap at LOW if any check fails', () => {
    const calc = new VerificationConfidence();
    const checks: CheckResult[] = [
       { checkId: '1', type: 'SYNTAX', status: CheckStatus.PASS, duration: 0, evidence: [], errors: [], warnings: [] },
       { checkId: '2', type: 'TEST', status: CheckStatus.FAIL, duration: 0, evidence: [], errors: [], warnings: [] }
    ];
    
    expect(calc.calculate(checks)).toBe('LOW');
  });

  it('confidence calculator should return HIGH for perfect runs', () => {
    const calc = new VerificationConfidence();
    const checks: CheckResult[] = [
       { checkId: '1', type: 'SYNTAX', status: CheckStatus.PASS, duration: 0, evidence: [], errors: [], warnings: [] },
       { checkId: '2', type: 'TYPE', status: CheckStatus.PASS, duration: 0, evidence: [], errors: [], warnings: [] },
       { checkId: '3', type: 'TEST', status: CheckStatus.PASS, duration: 0, evidence: [], errors: [], warnings: [] }
    ];
    
    expect(calc.calculate(checks)).toBe('HIGH');
  });
});
