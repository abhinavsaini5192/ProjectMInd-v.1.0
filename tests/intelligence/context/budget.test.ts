import { describe, it, expect } from 'vitest';
import { ContextBudgetManager } from '../../../src/intelligence/context/core/ContextBudgetManager';
import { ContextItem } from '../../../src/intelligence/context/models/ContextItem';
import { ContextType } from '../../../src/intelligence/context/models/ContextType';
import { ContextSourceType, TrustLevel } from '../../../src/intelligence/context/models/ContextSource';

describe('Context Budgeting (Phase 5.3)', () => {
  const budgetManager = new ContextBudgetManager();

  it('should calculate correct available context budget after reservations', () => {
    const budget = budgetManager.calculateBudget(8192, 2048, 1000, 500, 200);
    expect(budget.modelContextWindow).toBe(8192);
    expect(budget.outputReservation).toBe(2048);
    expect(budget.availableContextBudget).toBe(8192 - (2048 + 1000 + 500 + 200));
  });

  it('should preserve high-priority items and truncate low-priority items when budget is tight', () => {
    const budget = budgetManager.calculateBudget(2000, 500, 500, 200, 100); // available: 700 tokens

    const highPriorityItem: ContextItem = {
      id: 'high',
      type: ContextType.SYMBOL,
      content: 'Critical symbol content',
      sources: [{
        sourceType: ContextSourceType.KNOWLEDGE_GRAPH,
        sourceId: 'src_1',
        confidence: 1.0,
        timestamp: Date.now(),
        trustLevel: TrustLevel.VERIFIED_CODE_FACT
      }],
      relevance: 0.95,
      confidence: 1.0,
      priority: 1,
      tokenEstimate: 400
    };

    const lowPriorityItem: ContextItem = {
      id: 'low',
      type: ContextType.DOCUMENTATION,
      content: 'Massive documentation text',
      sources: [{
        sourceType: ContextSourceType.KNOWLEDGE_GRAPH,
        sourceId: 'src_2',
        confidence: 0.7,
        timestamp: Date.now(),
        trustLevel: TrustLevel.HISTORICAL_INFORMATION
      }],
      relevance: 0.5,
      confidence: 0.7,
      priority: 5,
      tokenEstimate: 500
    };

    const result = budgetManager.applyBudget([lowPriorityItem, highPriorityItem], budget);

    expect(result.acceptedItems.length).toBe(1);
    expect(result.acceptedItems[0].id).toBe('high');
    expect(result.truncatedItems.length).toBe(1);
    expect(result.truncatedItems[0].id).toBe('low');
  });
});
