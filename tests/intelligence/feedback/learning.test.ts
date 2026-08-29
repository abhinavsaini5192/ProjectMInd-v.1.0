import { describe, it, expect } from 'vitest';
import { LearningCoordinator } from '../../../src/intelligence/feedback/core/LearningCoordinator';
import { OutcomeAnalysis } from '../../../src/intelligence/feedback/models/OutcomeAnalysis';
import { ChangeSet } from '../../../src/intelligence/feedback/models/ChangeSet';

describe('Feedback: Learning Validation, Deduplication & Promotion', () => {
  it('should promote high-confidence successful outcome to PROMOTED and deduplicate duplicate learnings', () => {
    const coordinator = new LearningCoordinator();

    const outcome: OutcomeAnalysis = {
      outcomeId: 'out_1',
      executionId: 'exec_1',
      executionSuccess: true,
      objectiveSuccess: true,
      verificationSuccess: true,
      goalEvaluation: {
        goalStatus: 'ACHIEVED',
        explanation: 'Objective verified',
        evidenceIds: ['ev_1'],
        confidence: 0.95
      },
      unexpectedChanges: [],
      unresolvedIssues: []
    };

    const changes: ChangeSet = {
      filesAdded: [],
      filesModified: ['src/auth/AuthService.ts'],
      filesDeleted: [],
      filesMoved: [],
      symbolsChanged: ['sym_AuthService'],
      dependenciesChanged: [],
      architectureChanged: [],
      configurationChanged: [],
      records: [{
        resourceId: 'src/auth/AuthService.ts',
        resourceType: 'FILE',
        operation: 'MODIFIED',
        source: 'Execution',
        executionId: 'exec_1',
        confidence: 1.0
      }]
    };

    const result = coordinator.curateLearning('task_auth_fix', outcome, changes);
    expect(result.candidates.length).toBeGreaterThan(0);
    expect(result.promoted.length).toBeGreaterThan(0);
    expect(result.promoted[0].promotionStatus).toBe('PROMOTED');

    // Deduplicate against existing
    const secondPass = coordinator.curateLearning('task_auth_fix', outcome, changes, result.promoted);
    expect(secondPass.rejected.length).toBeGreaterThan(0);
    expect(secondPass.promoted.length).toBe(0);
  });
});
