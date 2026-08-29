export interface ActionPostcondition {
  conditionId: string;
  description: string;
  testable: boolean;
  target?: string;
}
