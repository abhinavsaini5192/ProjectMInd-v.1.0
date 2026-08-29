import { Decision } from '../../decision/models/Decision';
import { ContextPack, ContextMode, ContextWarning } from '../models/ContextPack';
import { ContextGraphBuilder } from '../planners/ContextGraphBuilder';
import { TaskPolicyEngine } from '../policies/TaskPolicyEngine';
import { ContextFreshnessAnalyzer } from '../analyzers/ContextFreshnessAnalyzer';
import { ContextDiversityManager } from '../planners/ContextDiversityManager';
import { ContextCompressor } from '../planners/ContextCompressor';
import { ContradictionDetector } from '../analyzers/ContradictionDetector';
import { ContextPackBuilder } from '../planners/ContextPackBuilder';
import { ContextCache } from '../cache/ContextCache';
import { KernelEventDispatcher } from '../../../kernel/core/KernelEventDispatcher';

import {
  CONTEXT_PLANNING_STARTED,
  CONTEXT_GRAPH_BUILT,
  CONTEXT_RANKED,
  CONTEXT_COMPRESSED,
  CONTEXT_BUDGET_OPTIMIZED,
  CONTEXT_CONTRADICTION_DETECTED,
  CONTEXT_PLAN_COMPLETED
} from '../types/ContextEvents';

export class ContextIntelligenceEngine {
  constructor(
    private graphBuilder: ContextGraphBuilder,
    private policyEngine: TaskPolicyEngine,
    private freshnessAnalyzer: ContextFreshnessAnalyzer,
    private diversityManager: ContextDiversityManager,
    private compressor: ContextCompressor,
    private contradictionDetector: ContradictionDetector,
    private packBuilder: ContextPackBuilder,
    private cache: ContextCache,
    private dispatcher: KernelEventDispatcher,
    private knowledgeGateway: any
  ) {}

  public generateContextPack(decision: Decision, repositoryId: string, mode: ContextMode = ContextMode.STANDARD, maxTokens: number = 50000): ContextPack {
    this.dispatcher.publish(CONTEXT_PLANNING_STARTED, { decisionId: decision.decisionId, mode });

    const cacheKey = this.cache.generateKey(repositoryId, decision.intent.type, mode);
    const cached = this.cache.get(cacheKey);
    if (cached) {
       this.dispatcher.publish(CONTEXT_PLAN_COMPLETED, { packId: cached.packId, cached: true });
       return cached;
    }

    const graph = this.graphBuilder.build(decision);
    this.dispatcher.publish(CONTEXT_GRAPH_BUILT, { nodes: graph.nodes.length });

    this.policyEngine.applyPolicy(graph.nodes, decision.intent.type);
    graph.nodes = this.freshnessAnalyzer.analyze(graph.nodes, repositoryId);
    this.diversityManager.ensureDiversity(graph);
    this.dispatcher.publish(CONTEXT_RANKED, { });

    graph.nodes = this.compressor.compress(graph.nodes, maxTokens);
    this.dispatcher.publish(CONTEXT_COMPRESSED, { });

    const warnings = this.contradictionDetector.detect(graph);
    if (warnings.length > 0) {
       this.dispatcher.publish(CONTEXT_CONTRADICTION_DETECTED, { warnings });
    }

    const pack = this.packBuilder.build(graph, decision, warnings, mode);
    
    this.cache.set(cacheKey, pack);
    this.dispatcher.publish(CONTEXT_PLAN_COMPLETED, { packId: pack.packId, cached: false });

    return pack;
  }
}
