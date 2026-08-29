import { ReasoningTask } from '../models/ReasoningTask';
import { ReasoningResult } from '../models/ReasoningResult';
import { ReasoningStrategy } from '../strategies/ReasoningStrategy';
import { StructuredOutputParser } from '../parsing/StructuredOutputParser';
import { ReasoningNormalizer } from '../parsing/ReasoningNormalizer';
import { ReasoningValidator } from '../validation/ReasoningValidator';
import { ReasoningValidationError } from '../errors/ReasoningValidationError';
import { InferenceManager } from '../../slm/inference/InferenceManager';
import { ModelSelectionResult } from '../../slm/models/ModelSelectionResult';
import { PromptBuilder } from '../../context/prompts/PromptBuilder';
import { SLMRequest } from '../../slm/models/SLMRequest';

export class ReasoningPipeline {
  private parser = new StructuredOutputParser();
  private normalizer = new ReasoningNormalizer();
  private validator = new ReasoningValidator();
  private promptBuilder = new PromptBuilder();

  constructor(
    private inferenceManager: InferenceManager,
    private maxRetries: number = 2
  ) {}

  public async execute(
    task: ReasoningTask,
    strategy: ReasoningStrategy,
    modelSelection: ModelSelectionResult
  ): Promise<ReasoningResult> {
    const strategyPrompt = strategy.buildStrategyPrompt(task);
    const combinedIntent = `${task.objective}\n\n${strategyPrompt}`;

    const { request: initialRequest } = this.promptBuilder.buildPrompt(
      combinedIntent,
      task.contextPackage,
      modelSelection.selectedModel.modelId
    );

    let currentRequest: SLMRequest = initialRequest;
    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt <= this.maxRetries) {
      attempt++;
      try {
        const slmResponse = await this.inferenceManager.execute(
          modelSelection,
          currentRequest,
          task.taskId
        );

        // 1. Parse structured output (from structuredOutput or raw text)
        const rawParsed = slmResponse.structuredOutput || this.parser.parse(slmResponse.output);

        // 2. Normalize fields
        const normalized = this.normalizer.normalize(
          rawParsed,
          task.taskId,
          modelSelection.selectedModel.modelId,
          task.contextPackage.packageId
        );

        // 3. Validate schema, evidence grounding, consistency, confidence
        const validation = this.validator.validate(normalized, task.contextPackage);
        normalized.validationStatus = validation.status;
        normalized.validationIssues = validation.issues;

        if (!validation.valid && validation.status === 'INVALID') {
          throw new ReasoningValidationError(
            'Reasoning output failed grounding or consistency validation',
            validation.issues
          );
        }

        // 4. Strategy post-processing
        const finalResult = strategy.postProcess(normalized as ReasoningResult);
        return finalResult;
      } catch (err: any) {
        lastError = err;

        // If it's a parse/JSON failure and we have retries left, request structured-output repair
        if (attempt <= this.maxRetries) {
          currentRequest = {
            ...currentRequest,
            requestId: `req_retry_${attempt}_${Date.now()}`,
            userInput: `${currentRequest.userInput}\n\n[ATTENTION: Previous response was invalid (${err.message}). Output strictly valid JSON matching the required schema.]`
          };
        }
      }
    }

    throw lastError || new Error('Reasoning pipeline execution failed');
  }
}
