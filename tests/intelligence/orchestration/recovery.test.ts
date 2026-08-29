import { describe, it, expect } from 'vitest';
import { RecoveryBridge } from '../../../src/intelligence/orchestration/core/RecoveryBridge';

describe('Recovery Bridge & Rollback (Phase 5.6)', () => {
  const recoveryBridge = new RecoveryBridge();

  it('should trigger retry on transient verification failure if within iteration budget', () => {
    const recovery = recoveryBridge.evaluateFailure(
      { planId: 'p1' } as any,
      { passed: false, checksRun: [], failures: ['Unit test assertion failed on test_login'] },
      1,
      5
    );

    expect(recovery.strategy).toBe('RETRY');
    expect(recovery.rollbackRequired).toBe(false);
  });

  it('should trigger rollback if iteration budget is exhausted or severe corruption occurs', () => {
    const recovery = recoveryBridge.evaluateFailure(
      { planId: 'p1' } as any,
      { passed: false, checksRun: [], failures: ['Unrecoverable schema corruption'] },
      1,
      5
    );

    expect(recovery.strategy).toBe('ROLLBACK');
    expect(recovery.rollbackRequired).toBe(true);
  });
});
