export type AgentContextMode = 'STRICT' | 'EXPLORATORY' | 'REASONING_ONLY';

export interface AgentTask {
  readonly taskId: string;
  readonly repositoryId: string;
  readonly request: string;
  readonly priority: number;
  readonly constraints: string[];
  readonly contextMode: AgentContextMode;
  readonly createdAt: number;
  readonly metadata: Record<string, string>;
}
