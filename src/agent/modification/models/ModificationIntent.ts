export enum ModificationOperation {
  CREATE_FILE = 'CREATE_FILE',
  DELETE_FILE = 'DELETE_FILE',
  RENAME_FILE = 'RENAME_FILE',
  ADD_IMPORT = 'ADD_IMPORT',
  REMOVE_IMPORT = 'REMOVE_IMPORT',
  ADD_FUNCTION = 'ADD_FUNCTION',
  REMOVE_FUNCTION = 'REMOVE_FUNCTION',
  MODIFY_FUNCTION = 'MODIFY_FUNCTION',
  ADD_CLASS = 'ADD_CLASS',
  MODIFY_CLASS = 'MODIFY_CLASS',
  REMOVE_CLASS = 'REMOVE_CLASS',
  ADD_INTERFACE_MEMBER = 'ADD_INTERFACE_MEMBER',
  MODIFY_INTERFACE = 'MODIFY_INTERFACE',
  ADD_ROUTE = 'ADD_ROUTE',
  MODIFY_ROUTE = 'MODIFY_ROUTE',
  ADD_DEPENDENCY = 'ADD_DEPENDENCY',
  REMOVE_DEPENDENCY = 'REMOVE_DEPENDENCY'
}

export interface ModificationIntent {
  operation: ModificationOperation;
  file: string;
  symbol?: string; // Optional if targeting a whole file
  intent: string;
  constraints: string[];
  expectedState?: string;
  impactLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}
