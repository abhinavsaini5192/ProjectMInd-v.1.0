import { describe, it, expect, beforeEach } from 'vitest';
import { ValidationEngine } from '../../src/knowledge/validation/core/ValidationEngine';
import { HealthCalculator } from '../../src/knowledge/validation/core/HealthCalculator';
import { RepairManager } from '../../src/knowledge/validation/core/RepairManager';
import { RelationshipValidator } from '../../src/knowledge/validation/validators/RelationshipValidator';
import { KernelEventDispatcher } from '../../src/kernel/core/KernelEventDispatcher';

describe('Knowledge Validation & Integrity Engine', () => {
  let engine: ValidationEngine;
  let dispatcher: KernelEventDispatcher;
  let repairManager: RepairManager;

  beforeEach(() => {
    dispatcher = new KernelEventDispatcher();
    engine = new ValidationEngine(new HealthCalculator(), dispatcher);
    repairManager = new RepairManager();
  });

  it('should validate a healthy repository and return 1.0 score', () => {
    // Mock healthy registries
    const symbolRegistry = { has: () => true };
    const relationshipRegistry = { getAll: () => [{ id: 'rel_1', sourceId: 'sym_1', targetId: 'sym_2' }] };
    
    engine.registerValidator(new RelationshipValidator(symbolRegistry, relationshipRegistry));
    
    const report = engine.runFullValidation('repo_123');

    expect(report.score).toBe(1.0);
    expect(report.status).toBe('HEALTHY');
    expect(report.issues.length).toBe(0);
  });

  it('should detect orphan relationships and degrade health score', () => {
    let degradationEvents = 0;
    dispatcher.subscribe('Validation:KnowledgeDegraded', () => degradationEvents++);

    // Mock corrupt registry where target symbol is missing
    const symbolRegistry = { has: (id: string) => id === 'sym_1' };
    const relationshipRegistry = { getAll: () => [{ id: 'rel_1', sourceId: 'sym_1', targetId: 'sym_missing' }] };
    
    engine.registerValidator(new RelationshipValidator(symbolRegistry, relationshipRegistry));
    
    const report = engine.runFullValidation('repo_123');

    expect(report.score).toBeLessThan(1.0); // Penalized
    expect(report.status).toBe('DEGRADED');
    expect(report.issues.length).toBe(1);
    expect(report.issues[0].message).toContain('Orphan relationship');
    expect(degradationEvents).toBe(1);
  });

  it('should allow safe repairs', () => {
    expect(repairManager.executeSafeRepair('flush_cache')).toBe(true);
  });

  it('should block unsafe destructive repairs', () => {
    expect(() => repairManager.executeSafeRepair('delete_symbol')).toThrowError(/destructive semantic repair/);
  });
});
