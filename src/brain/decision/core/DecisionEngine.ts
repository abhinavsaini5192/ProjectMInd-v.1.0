import { Decision } from '../models/Decision';
import { IntentAnalyzer } from '../analyzers/IntentAnalyzer';
import { ImpactAnalyzer } from '../analyzers/ImpactAnalyzer';
import { RiskAnalyzer } from '../analyzers/RiskAnalyzer';
import { TaskDecomposer } from '../planners/TaskDecomposer';
import { FeatureResolver } from '../planners/FeatureResolver';
import { ContextPlanner } from '../planners/ContextPlanner';
import { ContextRanker } from '../planners/ContextRanker';
import { ContextBudgetOptimizer } from '../planners/ContextBudgetOptimizer';
import { DecisionExplainer } from '../explainers/DecisionExplainer';
import { KernelEventDispatcher } from '../../../kernel/core/KernelEventDispatcher';
import crypto from 'crypto';

import {
  DECISION_STARTED,
  DECISION_COMPLETED,
  INTENT_RESOLVED,
  FEATURE_RESOLVED,
  CONTEXT_PLANNED,
  RISK_CALCULATED
} from '../types/DecisionEvents';

export class DecisionEngine {
  constructor(
    private intentAnalyzer: IntentAnalyzer,
    private taskDecomposer: TaskDecomposer,
    private featureResolver: FeatureResolver,
    private contextPlanner: ContextPlanner,
    private contextRanker: ContextRanker,
    private budgetOptimizer: ContextBudgetOptimizer,
    private impactAnalyzer: ImpactAnalyzer,
    private riskAnalyzer: RiskAnalyzer,
    private explainer: DecisionExplainer,
    private dispatcher: KernelEventDispatcher,
    private knowledgeGateway: any
  ) {}

  public processUserTask(task: string, repositoryId: string, maxTokens: number = 100000): Decision {
    this.dispatcher.publish(DECISION_STARTED, { task });

    const intent = this.intentAnalyzer.analyze(task);
    this.dispatcher.publish(INTENT_RESOLVED, { intent });

    const subtasks = this.taskDecomposer.decompose(task);
    const targetFeatures = this.featureResolver.resolve(subtasks, repositoryId);
    this.dispatcher.publish(FEATURE_RESOLVED, { features: targetFeatures });

    const impact = this.impactAnalyzer.analyze(targetFeatures, repositoryId);
    const risk = this.riskAnalyzer.analyze(impact.affectedFeatures);
    this.dispatcher.publish(RISK_CALCULATED, { risk });

    const rawContext = this.contextPlanner.plan(targetFeatures, repositoryId);
    const rankedContext = this.contextRanker.rank(rawContext);
    const budgetedContext = this.budgetOptimizer.optimize(rankedContext, maxTokens);
    this.dispatcher.publish(CONTEXT_PLANNED, { itemCount: budgetedContext.length });

    const required = budgetedContext.filter(c => c.category === 'REQUIRED');
    const recommended = budgetedContext.filter(c => c.category === 'USEFUL');
    const optional = budgetedContext.filter(c => c.category === 'OPTIONAL');
    const excluded = rawContext.filter(c => c.category === 'EXCLUDED');

    const decision: Decision = {
      decisionId: crypto.randomUUID(),
      action: 'PROCEED',
      intent,
      targetFeatures,
      recommendedContext: recommended,
      requiredContext: required,
      optionalContext: optional,
      excludedContext: excluded,
      affectedFeatures: impact.affectedFeatures,
      affectedTests: impact.affectedTests,
      risk,
      confidence: 0.95,
      reasons: []
    };

    decision.reasons = this.explainer.explain(decision);

    this.dispatcher.publish(DECISION_COMPLETED, { decisionId: decision.decisionId });

    return decision;
  }
}
