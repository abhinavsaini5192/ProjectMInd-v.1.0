export interface ActionDependency {
  stepId: string;
  dependsOnStepId: string;
  type: 'HARD' | 'SOFT';
  reason?: string;
}
