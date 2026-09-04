import { describe, it, expect } from 'vitest';
import { ContextQueryPlanner } from '../../../src/intelligence/decomposition/core/ContextQueryPlanner';
import { ContextRequirement } from '../../../src/intelligence/decomposition/models/ContextRequirement';
import { InformationGap } from '../../../src/intelligence/decomposition/models/InformationGap';

describe('Context Query Planning', () => {
  const planner = new ContextQueryPlanner();

  it('should plan prioritized queries and avoid duplicate targets', () => {
    const requirements: ContextRequirement[] = [
      {
        requirementId: 'req_1',
        subtaskId: 'sub_1',
        description: 'Need AuthService',
        resourceTypes: ['SYMBOL'],
        targetKeywords: ['AuthService', 'AuthController'],
        priority: 'HIGH',
        mandatory: true
      },
      {
        requirementId: 'req_2',
        subtaskId: 'sub_1',
        description: 'Also need AuthService',
        resourceTypes: ['SYMBOL'],
        targetKeywords: ['AuthService'], // Duplicate target
        priority: 'MEDIUM',
        mandatory: false
      }
    ];

    const gaps: InformationGap[] = [
      {
        gapId: 'gap_1',
        subtaskId: 'sub_1',
        description: 'Missing database connection config',
        severity: 'HIGH',
        blocking: true,
        confidence: 0.9,
        requiredEvidence: 'Config file',
        resolved: false
      }
    ];

    const queries = planner.planQueries(requirements, gaps);
    expect(queries.length).toBe(3); // AuthService (deduplicated), AuthController, and gap_1
    expect(queries[0].priority).toBe(1); // Gap query has top priority
  });
});
