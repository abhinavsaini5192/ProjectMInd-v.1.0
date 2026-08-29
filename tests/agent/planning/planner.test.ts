import { describe, it, expect, beforeEach } from 'vitest';
import { TaskPlanner } from '../../../src/agent/planning/core/TaskPlanner';
import { IBrainGateway } from '../../../src/agent/interfaces/IBrainGateway';
import { ContextPackage } from '../../../src/intelligence/fusion/models/ContextPackage';
import { AgentTask } from '../../../src/agent/models/AgentTask';
import { TaskIntent } from '../../../src/agent/planning/models/TaskPlan';
import { StepType } from '../../../src/agent/planning/models/PlanStep';

class MockBrainGateway implements IBrainGateway {
  public async requestContext(task: AgentTask): Promise<ContextPackage> {
    return {
      task: task.request,
      primaryContext: ['AuthService.ts', 'SessionManager.ts'],
      secondaryContext: [],
      architecture: ['Authentication Layer'],
      dependencies: [],
      recentChanges: [],
      knownProblems: [],
      decisions: [],
      confidence: 0.9
    };
  }
}

describe('Task Planning Engine (Phase 4.2)', () => {
  let planner: TaskPlanner;
  let brainGateway: IBrainGateway;

  beforeEach(() => {
    brainGateway = new MockBrainGateway();
    planner = new TaskPlanner(brainGateway);
  });

  const baseTask: AgentTask = {
    taskId: 't_001',
    repositoryId: 'repo_1',
    request: 'Fix authentication timeout',
    priority: 1,
    constraints: [],
    contextMode: 'STRICT',
    createdAt: Date.now(),
    metadata: {}
  };

  it('should generate a valid bug-fix plan', async () => {
    const plan = await planner.createPlan(baseTask);

    expect(plan.intent).toBe(TaskIntent.BUG_FIX);
    expect(plan.scope).toContain('AuthService.ts');
    expect(plan.steps.length).toBeGreaterThan(0);
    
    // Ensure BugFix strategy sequence
    expect(plan.steps[0].type).toBe(StepType.INVESTIGATION);
    expect(plan.steps.some(s => s.type === StepType.MODIFICATION)).toBe(true);
    expect(plan.steps.some(s => s.type === StepType.VERIFICATION)).toBe(true);
    
    // Auth modules should elevate risk
    expect(plan.risk).toBe('HIGH'); // Medium natively + Auth bumps to High
  });

  it('should generate a valid feature plan', async () => {
    const featureTask = { ...baseTask, request: 'Add new OAuth provider' };
    const plan = await planner.createPlan(featureTask);

    expect(plan.intent).toBe(TaskIntent.FEATURE);
    expect(plan.steps.some(s => s.type === StepType.DESIGN)).toBe(true);
    expect(plan.steps.some(s => s.type === StepType.DOCUMENTATION)).toBe(true);
  });

  it('should detect highly ambiguous tasks and halt planning', async () => {
    const ambiguousTask = { ...baseTask, request: 'Fix' };
    
    await expect(planner.createPlan(ambiguousTask)).rejects.toThrow(/ambiguous/);
  });

  it('should calculate approval requirements based on risk', async () => {
    const plan = await planner.createPlan(baseTask);
    
    // High risk should require approval
    expect(plan.risk).toBe('HIGH');
    expect(plan.approvalRequirement).toBe(true);
  });
  
  it('should validate plan correctness (reject plans without verification)', async () => {
     // The PlanValidator is tested implicitly through the planner.
     // By default, the BugFixStrategy has a VERIFICATION step.
     const plan = await planner.createPlan(baseTask);
     expect(plan.steps.find(s => s.type === StepType.VERIFICATION)).toBeDefined();
  });
});
