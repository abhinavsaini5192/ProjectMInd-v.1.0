export interface TaskQuestion {
  questionId: string;
  taskId: string;
  cycleId: string;
  reason: string;
  questionText: string;
  options: string[];
  recommendedOption?: string;
  required: boolean;
  userResponse?: string;
  createdAt: number;
}
