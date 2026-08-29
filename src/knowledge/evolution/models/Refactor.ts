import { RefactorType } from '../types/EvolutionTypes';

export interface Refactor {
  id: string;
  commitHash: string;
  type: RefactorType;
  sourceSymbolIds: string[];
  targetSymbolIds: string[];
  description: string;
}
