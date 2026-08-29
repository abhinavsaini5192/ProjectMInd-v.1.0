import { IDependency } from './Dependency';

export interface DependencyChain {
  id: string;
  path: string[]; // Ordered array of Symbol IDs [A, B, C]
  dependencies: IDependency[];
  isCircular: boolean;
  totalConfidence: number;
  maxLength: number;
}
