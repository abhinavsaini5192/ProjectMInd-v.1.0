import { BrainSession } from '../models/BrainSession';
import { BrainState } from '../models/BrainState';
import { BrainDecision } from '../models/BrainDecision';
import { ContextEngine } from '../../../intelligence/context/core/ContextEngine';
import { ReasoningEngine } from './ReasoningEngine';
import { InferenceManager } from '../../../intelligence/slm/inference/InferenceManager';
import { ModelSelector } from '../../../intelligence/slm/selection/ModelSelector';
import { KernelEventDispatcher } from '../../../kernel/core/KernelEventDispatcher';
import { AutonomousAgentLoop } from '../../../intelligence/orchestration/core/AutonomousAgentLoop';
import { StructuredReasoningEngine } from '../../../intelligence/reasoning/core/StructuredReasoningEngine';
import { PlanningCoordinator } from '../../../intelligence/planning/core/PlanningCoordinator';
import { LoopOutcome } from '../../../intelligence/orchestration/models/LoopOutcome';

export class BrainEngine {
  private contextEngine: ContextEngine;
  private reasoningEngine: ReasoningEngine;
  private autonomousLoop: AutonomousAgentLoop;

  constructor(
    private inferenceManager: InferenceManager, 
    private modelSelector: ModelSelector, 
    private dispatcher: KernelEventDispatcher,
    contextEngine?: ContextEngine
  ) {
     this.contextEngine = contextEngine || new ContextEngine();
     this.reasoningEngine = new ReasoningEngine(this.inferenceManager, this.modelSelector);
     const structuredReasoningEngine = new StructuredReasoningEngine(this.modelSelector, this.inferenceManager);
     const planningCoordinator = new PlanningCoordinator();
     this.autonomousLoop = new AutonomousAgentLoop(this.contextEngine, structuredReasoningEngine, planningCoordinator);
  }

  public async processRequest(taskId: string, intent: string): Promise<BrainDecision> {
    const session: BrainSession = {
       sessionId: `sess_${Date.now()}`,
       taskId,
       repositoryId: 'repo_1',
       workspaceId: 'workspace_1',
       state: BrainState.UNDERSTANDING,
       queries: [],
       context: null,
       reasoningRequests: [],
       reasoningResponses: [],
       decisions: [],
       confidence: 0,
       createdAt: Date.now(),
       updatedAt: Date.now()
    };

    this.dispatcher.publish('BRAIN_SESSION_STARTED', { sessionId: session.sessionId });

    try {
       session.state = BrainState.QUERYING;
       
       session.state = BrainState.ASSEMBLING_CONTEXT;
       const contextPackage = await this.contextEngine.buildContext(intent);
       session.context = contextPackage;

       session.state = BrainState.REASONING;
       const decision = await this.reasoningEngine.reason(taskId, intent, contextPackage);

       session.state = BrainState.EVALUATING;
       // Brain confidence is derived securely here rather than blindly trusting the SLM
       session.confidence = decision.confidence;

       session.decisions.push(decision);
       session.state = BrainState.DECISION_READY;

       this.dispatcher.publish('BRAIN_DECISION_READY', { decisionId: decision.decisionId });

       return decision;
    } catch (e: any) {
       session.state = BrainState.INVALID_DECISION;
       this.dispatcher.publish('BRAIN_DECISION_REJECTED', { reason: e.message });
       throw e;
    }
  }

  public async executeAutonomousLoop(taskId: string, intent: string): Promise<LoopOutcome> {
    return this.autonomousLoop.runLoop(taskId, intent);
  }
}

