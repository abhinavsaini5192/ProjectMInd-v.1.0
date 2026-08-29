import { SystemPromptBuilder } from './SystemPromptBuilder';
import { TaskPromptBuilder } from './TaskPromptBuilder';
import { ContextPromptBuilder } from './ContextPromptBuilder';
import { ContextPackage } from '../models/ContextPackage';
import { SLMRequest } from '../../slm/models/SLMRequest';

export interface PromptTrace {
  requestId: string;
  promptVersion: string;
  systemPromptVersion: string;
  taskPromptVersion: string;
  contextPromptVersion: string;
  contextPackageId: string;
  contextPlanId: string;
  tokenEstimate: number;
  timestamp: number;
}

export class PromptBuilder {
  public static readonly PROMPT_VERSION = '1.0';

  private systemBuilder = new SystemPromptBuilder();
  private taskBuilder = new TaskPromptBuilder();
  private contextBuilder = new ContextPromptBuilder();

  public buildPrompt(
    taskIntent: string,
    contextPackage: ContextPackage,
    modelId: string = 'default',
    timeout: number = 60000
  ): { request: SLMRequest; trace: PromptTrace } {
    const requestId = `req_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const systemInstructions = this.systemBuilder.buildSystemPrompt();
    const taskPrompt = this.taskBuilder.buildTaskPrompt(taskIntent);
    const contextPrompt = this.contextBuilder.buildContextPrompt(contextPackage);

    const userInput = [
      taskPrompt,
      '',
      contextPrompt
    ].join('\n');

    const trace: PromptTrace = {
      requestId,
      promptVersion: PromptBuilder.PROMPT_VERSION,
      systemPromptVersion: SystemPromptBuilder.VERSION,
      taskPromptVersion: TaskPromptBuilder.VERSION,
      contextPromptVersion: ContextPromptBuilder.VERSION,
      contextPackageId: contextPackage.packageId,
      contextPlanId: contextPackage.planId,
      tokenEstimate: contextPackage.tokenEstimate + 500, // context + system/task estimate
      timestamp: Date.now()
    };

    const request: SLMRequest = {
      requestId,
      model: modelId,
      systemInstructions,
      userInput,
      structuredContext: contextPackage,
      timeout,
      metadata: {
        promptTrace: trace
      }
    };

    return { request, trace };
  }
}
