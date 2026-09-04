import { TaskDecomposer } from './TaskDecomposer';
import { ContextRequirementAnalyzer } from './ContextRequirementAnalyzer';
import { ContextQueryPlanner } from './ContextQueryPlanner';
import { ContextSelector } from './ContextSelector';
import { KnowledgeAdapter } from '../integration/KnowledgeAdapter';
import { MemoryAdapter } from '../integration/MemoryAdapter';
import { WorkspaceAdapter } from '../integration/WorkspaceAdapter';
import { TaskGraph } from '../models/TaskGraph';
import { ContextSelection } from '../models/ContextSelection';
import { ContextBudget } from '../models/ContextBudget';

export class DecompositionEngine {
  private decomposer = new TaskDecomposer();
  private reqAnalyzer = new ContextRequirementAnalyzer();
  private queryPlanner = new ContextQueryPlanner();
  private selector = new ContextSelector();
  private knowledgeAdapter = new KnowledgeAdapter();
  private memoryAdapter = new MemoryAdapter();
  private workspaceAdapter = new WorkspaceAdapter();

  public decomposeTask(taskId: string, goalText: string): TaskGraph {
    return this.decomposer.decomposeTask(taskId, goalText);
  }

  public async prepareSubtaskContext(
    subtaskId: string,
    goalText: string,
    requiredHints: string[],
    budget: ContextBudget = { maxTokens: 8000, reservedTokens: 500, usedTokens: 500, remainingTokens: 7500 }
  ): Promise<ContextSelection> {
    const { requirements, informationGaps } = this.reqAnalyzer.analyzeRequirements({
      subtaskId,
      taskId: 'task_parent',
      title: goalText,
      objective: goalText,
      type: 'IMPLEMENTATION',
      status: 'READY',
      priority: 1,
      dependencies: [],
      prerequisites: [],
      successCriteria: [],
      requiredContext: requiredHints,
      estimatedComplexity: 'LOW',
      risk: 'LOW',
      createdAt: Date.now()
    });

    const queries = this.queryPlanner.planQueries(requirements, informationGaps);

    // Retrieve candidates
    const candidates = [];
    for (const q of queries) {
      const kCands = await this.knowledgeAdapter.queryKnowledge(q.queryTarget, [goalText, ...requiredHints]);
      for (const c of kCands) {
        c.content = this.workspaceAdapter.wrapUntrustedData(c.content, c.resourceId);
        candidates.push(c);
      }
    }

    const memCands = await this.memoryAdapter.queryMemory(goalText);
    for (const m of memCands) {
      candidates.push(m);
    }

    return this.selector.selectContext(subtaskId, candidates, budget, [goalText, ...requiredHints], requiredHints, informationGaps);
  }

  public explainTaskDecomposition(graph: TaskGraph): Record<string, any> {
    return {
      taskId: graph.taskId,
      subtaskCount: graph.subtasks.length,
      dependencyCount: graph.dependencies.length,
      confidence: graph.confidence,
      rationale: graph.rationale,
      subtasks: graph.subtasks.map(s => ({
        id: s.subtaskId,
        title: s.title,
        type: s.type,
        complexity: s.estimatedComplexity,
        dependencies: s.dependencies
      }))
    };
  }

  public explainContextSelection(selection: ContextSelection): Record<string, any> {
    return {
      subtaskId: selection.subtaskId,
      selectedCount: selection.selectedCandidates.length,
      excludedCount: selection.excludedCandidates.length,
      totalTokens: selection.totalTokens,
      confidence: selection.confidence,
      selected: selection.selectedCandidates.map(c => ({
        id: c.resourceId,
        score: c.relevance.overallScore,
        why: c.relevance.whyIncluded
      })),
      excluded: selection.excludedCandidates
    };
  }
}
