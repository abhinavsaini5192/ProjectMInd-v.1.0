import { ContextItem } from '../models/ContextItem';
import { ContextRequirement } from '../models/ContextRequirement';
import { ContextPlan } from '../models/ContextPlan';

export interface IContextRetriever {
  canHandle(requirement: ContextRequirement): boolean;
  retrieve(requirement: ContextRequirement, plan: ContextPlan): Promise<ContextItem[]>;
}
