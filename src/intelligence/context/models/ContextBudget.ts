export interface ContextBudget {
  modelContextWindow: number;
  systemPromptReservation: number;
  taskPromptReservation: number;
  outputReservation: number;
  safetyMargin: number;
  availableContextBudget: number;
  estimatedTotalTokens?: number;
}
