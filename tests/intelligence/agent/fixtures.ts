import { TaskOrchestrator } from '../../../src/intelligence/orchestration/core/TaskOrchestrator';
import { TaskLoop } from '../../../src/intelligence/orchestration/core/TaskLoop';
import { ContextAdapter } from '../../../src/intelligence/orchestration/integration/ContextAdapter';
import { ReasoningAdapter } from '../../../src/intelligence/orchestration/integration/ReasoningAdapter';
import { PlanningAdapter } from '../../../src/intelligence/orchestration/integration/PlanningAdapter';
import { ExecutionAdapter } from '../../../src/intelligence/orchestration/integration/ExecutionAdapter';
import { FeedbackAdapter } from '../../../src/intelligence/orchestration/integration/FeedbackAdapter';
import { ContextEngine } from '../../../src/intelligence/context/core/ContextEngine';
import { StructuredReasoningEngine } from '../../../src/intelligence/reasoning/core/StructuredReasoningEngine';
import { PlanningCoordinator } from '../../../src/intelligence/planning/core/PlanningCoordinator';
import { FeedbackEngine } from '../../../src/intelligence/feedback/core/FeedbackEngine';
import { ModelRegistry } from '../../../src/intelligence/slm/registry/ModelRegistry';
import { ModelSelector } from '../../../src/intelligence/slm/selection/ModelSelector';
import { InferenceManager } from '../../../src/intelligence/slm/inference/InferenceManager';
import { MockSLMProvider } from '../../../src/intelligence/slm/providers/MockSLMProvider';
import { ProjectMindAgent } from '../../../src/intelligence/agent/core/ProjectMindAgent';
import { AuditTrail } from '../../../src/intelligence/agent/observability/AuditTrail';
import { AgentMetrics } from '../../../src/intelligence/agent/observability/AgentMetrics';
import { PlanFreshnessValidator } from '../../../src/intelligence/agent/hardening/PlanFreshnessValidator';
import { BrainBoundaryGateway } from '../../../src/intelligence/agent/boundary/BrainBoundaryGateway';
import { DecompositionEngine } from '../../../src/intelligence/decomposition/core/DecompositionEngine';

export interface TestAgentEnvironment {
  agent: ProjectMindAgent;
  orchestrator: TaskOrchestrator;
  taskLoop: TaskLoop;
  mockProvider: MockSLMProvider;
  auditTrail: AuditTrail;
  metrics: AgentMetrics;
  freshnessValidator: PlanFreshnessValidator;
  brainGateway: BrainBoundaryGateway;
}

export async function createTestAgent(options: {
  withFreshness?: boolean;
  withDecomposition?: boolean;
} = {}): Promise<TestAgentEnvironment> {
  const registry = new ModelRegistry();
  const mockProvider = new MockSLMProvider();
  const models = await mockProvider.listModels();
  for (const m of models) registry.registerModel(m);

  const selector = new ModelSelector(registry);
  const inferenceManager = new InferenceManager({
    provider: 'mock',
    model: 'mock-model',
    endpoint: '',
    temperature: 0.1,
    contextWindow: 8192,
    maxOutputTokens: 1000,
    timeout: 1000,
  });
  inferenceManager.registerProvider('mock', mockProvider);

  const contextEngine = new ContextEngine();
  const reasoningEngine = new StructuredReasoningEngine(selector, inferenceManager);
  const planningCoordinator = new PlanningCoordinator();
  const feedbackEngine = new FeedbackEngine();

  const freshnessValidator = new PlanFreshnessValidator();
  const auditTrail = new AuditTrail();
  const metrics = new AgentMetrics();
  const brainGateway = new BrainBoundaryGateway(undefined, auditTrail);

  const loop = new TaskLoop(
    new ContextAdapter(contextEngine),
    new ReasoningAdapter(reasoningEngine),
    new PlanningAdapter(planningCoordinator),
    new ExecutionAdapter(),
    new FeedbackAdapter(feedbackEngine),
    options.withFreshness ? freshnessValidator : undefined
  );

  const orchestrator = new TaskOrchestrator(loop);

  let decompositionEngine: DecompositionEngine | undefined;
  if (options.withDecomposition) {
    decompositionEngine = new DecompositionEngine();
  }

  const agent = new ProjectMindAgent({
    orchestrator,
    ...(decompositionEngine ? { decompositionEngine } : {}),
    auditTrail,
    metrics,
    freshnessValidator,
    brainGateway,
  });

  return {
    agent,
    orchestrator,
    taskLoop: loop,
    mockProvider,
    auditTrail,
    metrics,
    freshnessValidator,
    brainGateway,
  };
}
