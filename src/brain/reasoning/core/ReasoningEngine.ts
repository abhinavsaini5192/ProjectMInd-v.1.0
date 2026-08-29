import { ContextPack } from '../../context/models/ContextPack';
import { ReasoningState } from '../models/ReasoningState';
import { EvidenceEngine } from '../analyzers/EvidenceEngine';
import { HypothesisEngine } from '../analyzers/HypothesisEngine';
import { ConfidenceEngine } from '../analyzers/ConfidenceEngine';
import { ContradictionReasoner } from '../analyzers/ContradictionReasoner';
import { UncertaintyEngine } from '../uncertainty/UncertaintyEngine';
import { KnowledgeGapAnalyzer } from '../uncertainty/KnowledgeGapAnalyzer';
import { ClarificationEngine } from '../uncertainty/ClarificationEngine';
import { DecisionThresholdEngine } from '../policies/DecisionThresholdEngine';
import { ReasoningStateManager } from './ReasoningStateManager';
import { KernelEventDispatcher } from '../../../kernel/core/KernelEventDispatcher';
import crypto from 'crypto';

import {
  REASONING_STARTED,
  EVIDENCE_COLLECTED,
  HYPOTHESIS_GENERATED,
  CONFIDENCE_CALCULATED,
  KNOWLEDGE_GAP_DETECTED,
  CLARIFICATION_REQUIRED,
  REASONING_COMPLETED
} from '../types/ReasoningEvents';

export class ReasoningEngine {
  constructor(
    private evidenceEngine: EvidenceEngine,
    private hypothesisEngine: HypothesisEngine,
    private confidenceEngine: ConfidenceEngine,
    private contradictionReasoner: ContradictionReasoner,
    private uncertaintyEngine: UncertaintyEngine,
    private gapAnalyzer: KnowledgeGapAnalyzer,
    private clarificationEngine: ClarificationEngine,
    private thresholdEngine: DecisionThresholdEngine,
    private stateManager: ReasoningStateManager,
    private dispatcher: KernelEventDispatcher
  ) {}

  public process(task: string, pack: ContextPack, repositoryId: string, snapshotId: string): ReasoningState {
    this.dispatcher.publish(REASONING_STARTED, { task });

    const evidence = this.evidenceEngine.extractEvidence(task, pack);
    this.dispatcher.publish(EVIDENCE_COLLECTED, { count: evidence.length });

    const hypotheses = this.hypothesisEngine.generateHypotheses(task, evidence);
    this.dispatcher.publish(HYPOTHESIS_GENERATED, { count: hypotheses.length });

    let maxConfidence = 0;
    for (const h of hypotheses) {
       h.confidence = this.confidenceEngine.calculateConfidence(h);
       if (h.confidence > maxConfidence) maxConfidence = h.confidence;
    }
    this.dispatcher.publish(CONFIDENCE_CALCULATED, { maxConfidence });

    const state: ReasoningState = {
       stateId: crypto.randomUUID(),
       repositoryId,
       task,
       hypotheses,
       allEvidence: evidence,
       uncertaintyTypes: [],
       knowledgeGaps: [],
       confidence: maxConfidence,
       decisionThreshold: this.thresholdEngine.evaluate(maxConfidence),
       isStale: false,
       snapshotId
    };

    state.uncertaintyTypes = this.uncertaintyEngine.classify(state);
    state.knowledgeGaps = this.gapAnalyzer.analyze(state);
    
    if (state.knowledgeGaps.length > 0) {
       this.dispatcher.publish(KNOWLEDGE_GAP_DETECTED, { count: state.knowledgeGaps.length });
       state.clarificationRequest = this.clarificationEngine.generate(state.knowledgeGaps);
       if (state.clarificationRequest) {
          this.dispatcher.publish(CLARIFICATION_REQUIRED, { request: state.clarificationRequest });
       }
    }

    this.stateManager.save(state);
    this.dispatcher.publish(REASONING_COMPLETED, { stateId: state.stateId });

    return state;
  }
}
