import { describe, it, expect, beforeEach } from 'vitest';
import { createTestAgent } from './fixtures';
import type { TestAgentEnvironment } from './fixtures';
import { FailureTaxonomy } from '../../../src/intelligence/agent/taxonomy/FailureTaxonomy';
import type { AgentRequest } from '../../../src/intelligence/agent/models/AgentRequest';

describe('ProjectMindAgent: Stalled Task Detection & Recovery', () => {
  let env: TestAgentEnvironment;

  beforeEach(async () => {
    env = await createTestAgent();
  });

  it('should categorize stall and loop conditions appropriately', () => {
    const stalledErr = new Error('Task stalled: no forward progress after repeated plan modifications');
    const record = FailureTaxonomy.classify(stalledErr, 'LoopGuard');

    expect(record.category).toBe('PLANNING_ERROR');
    expect(record.recoveryAction).toBe('REPAIR_PLAN');
  });

  it('should classify timeout and system errors properly', () => {
    const timeoutErr = new Error('Execution timed out after 60000ms');
    const record = FailureTaxonomy.classify(timeoutErr, 'TaskOrchestrator');

    expect(record.category).toBe('TIMEOUT');
    expect(record.fatal).toBe(true);
    expect(record.recoveryAction).toBe('ABORT');
  });
});
