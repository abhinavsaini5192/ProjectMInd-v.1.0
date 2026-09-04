import { Subtask, SubtaskType } from '../models/Subtask';
import { ComplexityGuard } from '../guards/ComplexityGuard';

export class SubtaskPlanner {
  private complexityGuard = new ComplexityGuard();

  public planSubtasks(taskId: string, goalText: string): Subtask[] {
    const complexity = this.complexityGuard.estimateComplexity(goalText, 3, 2);
    const text = goalText.toLowerCase();

    if (complexity === 'TRIVIAL') {
      return [
        {
          subtaskId: `${taskId}_sub_1`,
          taskId,
          title: 'Apply Direct Modification',
          objective: goalText,
          type: 'IMPLEMENTATION',
          status: 'READY',
          priority: 1,
          dependencies: [],
          prerequisites: [],
          successCriteria: ['Direct code change applied and syntax checked'],
          requiredContext: ['target_symbol'],
          estimatedComplexity: 'TRIVIAL',
          risk: 'LOW',
          createdAt: Date.now()
        }
      ];
    }

    if (text.includes('jwt') || text.includes('auth')) {
      return [
        {
          subtaskId: `${taskId}_sub_1`,
          taskId,
          title: 'Discover & Understand Existing Authentication Infrastructure',
          objective: 'Inspect current user models, session managers, and route handlers',
          type: 'DISCOVERY',
          status: 'READY',
          priority: 1,
          dependencies: [],
          prerequisites: [],
          successCriteria: ['Authentication entry points and user models identified'],
          requiredContext: ['AuthService', 'AuthController', 'User'],
          estimatedComplexity: 'LOW',
          risk: 'LOW',
          createdAt: Date.now()
        },
        {
          subtaskId: `${taskId}_sub_2`,
          taskId,
          title: 'Design Token Structure & Middleware Contracts',
          objective: 'Design payload schema, signing options, and middleware interception',
          type: 'DESIGN',
          status: 'PENDING',
          priority: 2,
          dependencies: [`${taskId}_sub_1`],
          prerequisites: ['Authentication infrastructure understood'],
          successCriteria: ['Token format and verification contract finalized'],
          requiredContext: ['JWT_CONFIG', 'auth_middleware'],
          estimatedComplexity: 'LOW',
          risk: 'LOW',
          createdAt: Date.now()
        },
        {
          subtaskId: `${taskId}_sub_3`,
          taskId,
          title: 'Implement Token Generation & Validation Logic',
          objective: 'Write token generator in AuthService and authorization middleware',
          type: 'IMPLEMENTATION',
          status: 'PENDING',
          priority: 3,
          dependencies: [`${taskId}_sub_2`],
          prerequisites: ['Design specification complete'],
          successCriteria: ['Token issued on login and rejected if expired/invalid'],
          requiredContext: ['AuthService'],
          estimatedComplexity: 'MEDIUM',
          risk: 'MEDIUM',
          createdAt: Date.now()
        },
        {
          subtaskId: `${taskId}_sub_4`,
          taskId,
          title: 'Verify End-to-End Authentication Flow & Regression Tests',
          objective: 'Execute test suite for auth controller, token middleware, and edge cases',
          type: 'VERIFICATION',
          status: 'PENDING',
          priority: 4,
          dependencies: [`${taskId}_sub_3`],
          prerequisites: ['Implementation complete'],
          successCriteria: ['All authentication test cases pass with 0 regressions'],
          requiredContext: ['test_auth'],
          estimatedComplexity: 'LOW',
          risk: 'LOW',
          createdAt: Date.now()
        }
      ];
    }

    // Default multi-stage plan
    return [
      {
        subtaskId: `${taskId}_sub_1`,
        taskId,
        title: `Analyze Scope for: ${goalText}`,
        objective: 'Analyze relevant symbols and dependencies',
        type: 'ANALYSIS',
        status: 'READY',
        priority: 1,
        dependencies: [],
        prerequisites: [],
        successCriteria: ['Scope and dependencies documented'],
        requiredContext: ['target_modules'],
        estimatedComplexity: 'LOW',
        risk: 'LOW',
        createdAt: Date.now()
      },
      {
        subtaskId: `${taskId}_sub_2`,
        taskId,
        title: `Execute Implementation for: ${goalText}`,
        objective: goalText,
        type: 'IMPLEMENTATION',
        status: 'PENDING',
        priority: 2,
        dependencies: [`${taskId}_sub_1`],
        prerequisites: ['Analysis complete'],
        successCriteria: ['Modifications applied successfully'],
        requiredContext: ['target_symbols'],
        estimatedComplexity: complexity,
        risk: 'MEDIUM',
        createdAt: Date.now()
      },
      {
        subtaskId: `${taskId}_sub_3`,
        taskId,
        title: `Verify Changes for: ${goalText}`,
        objective: 'Run test suite and regression checks',
        type: 'VERIFICATION',
        status: 'PENDING',
        priority: 3,
        dependencies: [`${taskId}_sub_2`],
        prerequisites: ['Implementation complete'],
        successCriteria: ['All tests pass'],
        requiredContext: ['test_suites'],
        estimatedComplexity: 'LOW',
        risk: 'LOW',
        createdAt: Date.now()
      }
    ];
  }
}
