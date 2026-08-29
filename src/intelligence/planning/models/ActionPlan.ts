import { ActionStep } from './ActionStep';
import { ActionDependency } from './ActionDependency';
import { ActionPrecondition } from './ActionPrecondition';
import { ActionPostcondition } from './ActionPostcondition';
import { ActionRisk } from './ActionRisk';
import { ValidationPlan } from './ValidationPlan';
import { InformationRequest } from './InformationRequest';
import { PlanStatus } from './PlanStatus';

export interface ActionPlan {
  planId: string;
  decisionId: string;
  taskId: string;
  objective: string;
  status: PlanStatus;
  steps: ActionStep[];
  dependencies: ActionDependency[];
  preconditions: ActionPrecondition[];
  postconditions: ActionPostcondition[];
  risks: ActionRisk[];
  validationPlan: ValidationPlan;
  affectedResources: string[];
  estimatedComplexity: 'LOW' | 'MEDIUM' | 'HIGH';
  confidence: number;
  knowledgeVersion: string;
  contextVersion: string;
  reasoningId: string;
  informationRequests?: InformationRequest[];
  alternativePlans?: ActionPlan[];
  createdAt: number;
}
