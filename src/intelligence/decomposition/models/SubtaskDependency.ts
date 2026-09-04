export interface SubtaskDependency {
  sourceSubtaskId: string;
  targetSubtaskId: string;
  type: 'HARD' | 'SOFT' | 'INFORMATIONAL';
  description?: string;
}
