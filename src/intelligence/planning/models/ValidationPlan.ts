export interface ValidationPlan {
  validationId: string;
  steps: string[];
  requiredTests: string[];
  typeCheck: boolean;
  architectureCheck: boolean;
  dependencyCheck: boolean;
}
