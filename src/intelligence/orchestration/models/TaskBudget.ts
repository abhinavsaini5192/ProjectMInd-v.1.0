export interface TaskBudget {
  maxCycles: number;
  maxExecutionTimeMs: number;
  maxExecutionSteps: number;
  maxFilesChanged: number;
  maxCommands: number;
  maxRetries: number;
  maxReplans: number;
  maxSLMCalls: number;
  maxContextTokens: number;
}

export const DEFAULT_TASK_BUDGET: TaskBudget = {
  maxCycles: 5,
  maxExecutionTimeMs: 120000,
  maxExecutionSteps: 20,
  maxFilesChanged: 15,
  maxCommands: 10,
  maxRetries: 2,
  maxReplans: 3,
  maxSLMCalls: 10,
  maxContextTokens: 32000
};
