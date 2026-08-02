/**
 * Base class for all ProjectMind errors.
 */
export class ProjectMindError extends Error {
  public code: string;
  public suggestedRecovery?: string;

  constructor(message: string, code: string, suggestedRecovery?: string) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.suggestedRecovery = suggestedRecovery;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * An error from which the system can safely recover or retry.
 */
export class RecoverableError extends ProjectMindError {
  constructor(message: string, code: string = 'RECOVERABLE_ERROR', suggestedRecovery?: string) {
    super(message, code, suggestedRecovery);
  }
}

/**
 * A fatal error requiring system halt or explicit user intervention.
 */
export class FatalError extends ProjectMindError {
  constructor(message: string, code: string = 'FATAL_ERROR', suggestedRecovery?: string) {
    super(message, code, suggestedRecovery);
  }
}

/**
 * Thrown when data validation (e.g., config, state) fails.
 */
export class ValidationError extends ProjectMindError {
  constructor(message: string, code: string = 'VALIDATION_ERROR', suggestedRecovery?: string) {
    super(message, code, suggestedRecovery);
  }
}

/**
 * Thrown when the .projectmind workspace is corrupted or missing.
 */
export class WorkspaceError extends ProjectMindError {
  constructor(message: string, code: string = 'WORKSPACE_ERROR', suggestedRecovery?: string) {
    super(message, code, suggestedRecovery);
  }
}

/**
 * Thrown when configuration is invalid or missing.
 */
export class ConfigurationError extends ProjectMindError {
  constructor(message: string, code: string = 'CONFIG_ERROR', suggestedRecovery?: string) {
    super(message, code, suggestedRecovery);
  }
}
