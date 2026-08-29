import { ContextItem } from './ContextItem';
import { ContextBudget } from './ContextBudget';
import { ContextConflict } from './ContextConflict';

export interface ContextSection {
  title: string;
  type: string;
  items: ContextItem[];
}

export interface ContextPackage {
  packageId: string;
  planId: string;
  taskId: string;
  summary: string;
  items: ContextItem[];
  sections: ContextSection[];
  conflicts: ContextConflict[];
  tokenEstimate: number;
  budget: ContextBudget;
  generatedAt: number;
}
