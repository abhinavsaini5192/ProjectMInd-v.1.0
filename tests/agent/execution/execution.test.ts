import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { ExecutionEngine } from '../../../src/agent/execution/core/ExecutionEngine';
import { ExecutionScheduler } from '../../../src/agent/execution/core/ExecutionScheduler';
import { FileExecutor } from '../../../src/agent/execution/executors/FileExecutor';
import { SearchExecutor } from '../../../src/agent/execution/executors/SearchExecutor';
import { VerificationExecutor } from '../../../src/agent/execution/executors/VerificationExecutor';
import { GitExecutor } from '../../../src/agent/execution/executors/GitExecutor';
import { ActionGraph } from '../../../src/agent/actions/models/ActionGraph';
import { AgentAction } from '../../../src/agent/actions/models/AgentAction';
import { ActionType } from '../../../src/agent/actions/models/ActionType';
import { ExecutionContext } from '../../../src/agent/execution/models/ExecutionContext';
import { ExecutionState } from '../../../src/agent/execution/models/ExecutionState';
import { KernelEventDispatcher } from '../../../src/kernel/core/KernelEventDispatcher';

describe('Execution Engine (Phase 4.5)', () => {
  let engine: ExecutionEngine;
  let testRepoRoot: string;
  let testWorkspaceRoot: string;

  beforeEach(() => {
    testWorkspaceRoot = path.join(__dirname, '.test_workspace');
    testRepoRoot = path.join(testWorkspaceRoot, 'repo1');
    fs.mkdirSync(testRepoRoot, { recursive: true });

    engine = new ExecutionEngine(
       new ExecutionScheduler(),
       [new FileExecutor(), new SearchExecutor(), new VerificationExecutor(), new GitExecutor()],
       new KernelEventDispatcher()
    );
  });

  afterEach(() => {
    if (fs.existsSync(testWorkspaceRoot)) {
       fs.rmSync(testWorkspaceRoot, { recursive: true, force: true });
    }
  });

  const createMockContext = (decisions: Record<string, 'ALLOW' | 'DENY'>): ExecutionContext => {
    const policyMap = new Map();
    for (const [actionId, decision] of Object.entries(decisions)) {
       policyMap.set(actionId, { decision });
    }
    return {
      executionId: 'exec_1',
      taskId: 't1',
      planId: 'p1',
      repositoryRoot: testRepoRoot,
      workspaceRoot: testWorkspaceRoot,
      permissions: [],
      policyDecisions: policyMap,
      environmentMetadata: {},
      isCancelled: false,
      dryRun: false
    };
  };

  it('should successfully execute a CREATE_FILE action', async () => {
    const graph = new ActionGraph();
    const actionId = 'a1';
    graph.addAction({
       actionId, taskId: 't1', planId: 'p1', stepId: 's1', type: ActionType.CREATE_FILE, 
       target: 'test.ts', parameters: { content: 'console.log("hi");' }, dependencies: [], preconditions: [], expectedOutcome: '', provenance: '', risk: 'LOW', confidence: 1, createdAt: Date.now()
    } as AgentAction);

    const context = createMockContext({ [actionId]: 'ALLOW' });
    const result = await engine.execute(graph, context);

    expect(result.status).toBe(ExecutionState.SUCCEEDED);
    expect(result.succeeded).toBe(1);
    
    const fileExists = fs.existsSync(path.join(testRepoRoot, 'test.ts'));
    expect(fileExists).toBe(true);
  });

  it('should completely block downstream actions if a dependency fails', async () => {
    const graph = new ActionGraph();
    
    // Action 1 will fail because it reads a non-existent file
    graph.addAction({
       actionId: 'read_fail', taskId: 't1', planId: 'p1', stepId: 's1', type: ActionType.READ_FILE, 
       target: 'doesnotexist.ts', parameters: {}, dependencies: [], preconditions: [], expectedOutcome: '', provenance: '', risk: 'LOW', confidence: 1, createdAt: Date.now()
    } as AgentAction);
    
    // Action 2 depends on Action 1
    graph.addAction({
       actionId: 'edit_dependent', taskId: 't1', planId: 'p1', stepId: 's1', type: ActionType.EDIT_FILE, 
       target: 'somefile.ts', parameters: {}, dependencies: ['read_fail'], preconditions: [], expectedOutcome: '', provenance: '', risk: 'LOW', confidence: 1, createdAt: Date.now()
    } as AgentAction);

    const context = createMockContext({ 'read_fail': 'ALLOW', 'edit_dependent': 'ALLOW' });
    const result = await engine.execute(graph, context);

    expect(result.status).toBe(ExecutionState.FAILED);
    expect(result.failed).toBe(1); // read_fail
    expect(result.blocked).toBe(1); // edit_dependent should never run

    const blockedAction = result.actions.find(a => a.actionId === 'edit_dependent');
    // The scheduler sets the internal state to BLOCKED, and execution ignores it, 
    // so it shouldn't even appear in actionResults or if it does, it's not run.
    expect(blockedAction).toBeUndefined(); // Didn't even reach executor
  });

  it('should throw PathTraversal errors if target escapes the workspace', async () => {
    const graph = new ActionGraph();
    graph.addAction({
       actionId: 'a_bad', taskId: 't1', planId: 'p1', stepId: 's1', type: ActionType.CREATE_FILE, 
       target: '../../escape.txt', parameters: { content: 'hacked' }, dependencies: [], preconditions: [], expectedOutcome: '', provenance: '', risk: 'LOW', confidence: 1, createdAt: Date.now()
    } as AgentAction);

    const context = createMockContext({ 'a_bad': 'ALLOW' });
    const result = await engine.execute(graph, context);

    expect(result.status).toBe(ExecutionState.FAILED);
    expect(result.errors[0]).toContain('Path escape detected');
  });

  it('should refuse to execute actions that are DENIED by security policy', async () => {
    const graph = new ActionGraph();
    graph.addAction({
       actionId: 'a_denied', taskId: 't1', planId: 'p1', stepId: 's1', type: ActionType.CREATE_FILE, 
       target: 'test.ts', parameters: { content: 'test' }, dependencies: [], preconditions: [], expectedOutcome: '', provenance: '', risk: 'LOW', confidence: 1, createdAt: Date.now()
    } as AgentAction);

    const context = createMockContext({ 'a_denied': 'DENY' });
    const result = await engine.execute(graph, context);

    expect(result.status).toBe(ExecutionState.FAILED);
    expect(result.errors[0]).toContain('DENIED by policy');
  });

  it('should simulate execution successfully in dry-run mode', async () => {
    const graph = new ActionGraph();
    graph.addAction({
       actionId: 'a_dry', taskId: 't1', planId: 'p1', stepId: 's1', type: ActionType.CREATE_FILE, 
       target: 'test_dry.ts', parameters: { content: 'dry' }, dependencies: [], preconditions: [], expectedOutcome: '', provenance: '', risk: 'LOW', confidence: 1, createdAt: Date.now()
    } as AgentAction);

    const context = createMockContext({ 'a_dry': 'ALLOW' });
    context.dryRun = true;
    
    const result = await engine.execute(graph, context);
    expect(result.status).toBe(ExecutionState.SUCCEEDED);
    
    // Ensure file was NEVER actually created
    const fileExists = fs.existsSync(path.join(testRepoRoot, 'test_dry.ts'));
    expect(fileExists).toBe(false);
  });
});
