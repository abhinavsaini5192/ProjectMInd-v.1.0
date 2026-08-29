export enum FailureType {
  PRECONDITION_FAILED = 'PRECONDITION_FAILED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  TARGET_NOT_FOUND = 'TARGET_NOT_FOUND',
  CONFLICT = 'CONFLICT',
  TIMEOUT = 'TIMEOUT',
  PROCESS_FAILED = 'PROCESS_FAILED',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  CANCELLED = 'CANCELLED',
  PATH_TRAVERSAL = 'PATH_TRAVERSAL'
}

export class ExecutionError extends Error {
  constructor(public type: FailureType, message: string) {
    super(message);
    this.name = 'ExecutionError';
  }
}
