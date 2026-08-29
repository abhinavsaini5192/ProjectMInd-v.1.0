export type PreconditionType =
  | 'SYMBOL_EXISTS'
  | 'FILE_EXISTS'
  | 'DEPENDENCY_VALID'
  | 'TESTS_PASS'
  | 'CONFIG_VALID'
  | 'STATE_UNCHANGED';

export interface ActionPrecondition {
  type: PreconditionType;
  target: string;
  expectedState?: string;
}
