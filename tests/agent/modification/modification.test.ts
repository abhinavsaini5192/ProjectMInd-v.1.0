import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { ModificationEngine } from '../../../src/agent/modification/core/ModificationEngine';
import { ContextResolver } from '../../../src/agent/modification/core/ContextResolver';
import { ModificationIntent, ModificationOperation } from '../../../src/agent/modification/models/ModificationIntent';
import { KernelEventDispatcher } from '../../../src/kernel/core/KernelEventDispatcher';

describe('Intelligent Code Modification Engine (Phase 4.6)', () => {
  let engine: ModificationEngine;
  let dispatcher: KernelEventDispatcher;
  let testWorkspaceRoot: string;
  let testFilePath: string;

  beforeEach(() => {
    testWorkspaceRoot = path.join(__dirname, '.test_workspace');
    fs.mkdirSync(testWorkspaceRoot, { recursive: true });
    
    // We mock ContextResolver inside tests to point to our test file
    testFilePath = path.join(testWorkspaceRoot, 'AuthService.ts');
    fs.writeFileSync(testFilePath, 'function login() {\n  return true;\n}\n', 'utf8');

    dispatcher = new KernelEventDispatcher();
    engine = new ModificationEngine(dispatcher);
    
    // Mock resolver logic for tests
    (engine as any).resolver.resolveTarget = (intent: ModificationIntent) => ({
       absolutePath: testFilePath,
       symbolRange: intent.symbol ? { startLine: 1, endLine: 3 } : undefined
    });
  });

  afterEach(() => {
    if (fs.existsSync(testWorkspaceRoot)) {
       fs.rmSync(testWorkspaceRoot, { recursive: true, force: true });
    }
  });

  it('should successfully prepare a ModificationTransaction and generate a ChangeSet', async () => {
    const intent: ModificationIntent = {
       operation: ModificationOperation.MODIFY_FUNCTION,
       file: 'AuthService.ts',
       symbol: 'login',
       intent: 'Add token validation',
       constraints: []
    };

    const tx = await engine.prepareModification(intent, 'action_1');
    const changeSet = tx.getChangeSet();

    expect(changeSet).toBeDefined();
    expect(changeSet.operation).toBe(ModificationOperation.MODIFY_FUNCTION);
    expect(changeSet.patch).toContain('+ function login() { // Added token validation');
  });

  it('should reject ambiguous targets in ContextResolver', async () => {
    const intent: ModificationIntent = {
       operation: ModificationOperation.MODIFY_FUNCTION,
       file: 'AuthService.ts',
       symbol: 'init', // The mock resolver explicitly throws on 'init'
       intent: 'Fix init',
       constraints: []
    };

    // Replace the mock back to original to test the throw
    (engine as any).resolver = new ContextResolver();

    await expect(engine.prepareModification(intent, 'action_2')).rejects.toThrow('Ambiguous symbol target: init');
  });

  it('should fail PatchValidator if unmatched brackets are introduced', async () => {
    const intent: ModificationIntent = {
       operation: ModificationOperation.MODIFY_FUNCTION,
       file: 'AuthService.ts',
       symbol: 'login',
       intent: 'Break syntax',
       constraints: []
    };

    // Mock generator to return bad syntax
    (engine as any).generator.generateChange = () => 'function login() { return true;'; // Missing closing bracket

    await expect(engine.prepareModification(intent, 'action_3')).rejects.toThrow('Unmatched brackets detected');
  });

  it('should rollback file to ModificationSnapshot on execution failure', async () => {
    const intent: ModificationIntent = {
       operation: ModificationOperation.MODIFY_FUNCTION,
       file: 'AuthService.ts',
       symbol: 'login',
       intent: 'Add token validation',
       constraints: []
    };

    const tx = await engine.prepareModification(intent, 'action_4');
    
    // Simulate execution failing after it partially wrote the file (simulated by us overwriting it directly)
    const changeSet = tx.getChangeSet();
    
    expect(() => {
       engine.executeTransaction(tx, (cSet) => {
          fs.writeFileSync(cSet.file, 'BROKEN STATE', 'utf8');
          throw new Error('Execution Engine crashed during write!');
       });
    }).toThrow('Execution failed, rolled back');

    // Rollback should have restored the file
    const restoredContent = fs.readFileSync(testFilePath, 'utf8');
    expect(restoredContent).toBe('function login() {\n  return true;\n}\n');
  });

  it('should throw CONFLICT if expectedState hash does not match current file', async () => {
    const intent: ModificationIntent = {
       operation: ModificationOperation.MODIFY_FUNCTION,
       file: 'AuthService.ts',
       symbol: 'login',
       intent: 'Add token validation',
       constraints: [],
       expectedState: 'bad_hash_123'
    };

    await expect(engine.prepareModification(intent, 'action_5')).rejects.toThrow('CONFLICT: Expected file state does not match current state');
  });
});
