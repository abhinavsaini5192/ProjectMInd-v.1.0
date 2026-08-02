import { ProjectMindError } from '../../errors';

export class ConnectivityError extends ProjectMindError {
  constructor(message: string, code: string) {
    super(message, code);
  }
}

export class RepositoryNotLoadedError extends ConnectivityError {
  constructor(message = 'Repository is not loaded.') {
    super(message, 'REPOSITORY_NOT_LOADED');
  }
}

export class ContextUnavailableError extends ConnectivityError {
  constructor(message = 'Context is unavailable.') {
    super(message, 'CONTEXT_UNAVAILABLE');
  }
}

export class PermissionDeniedError extends ConnectivityError {
  constructor(message = 'Permission denied.') {
    super(message, 'PERMISSION_DENIED');
  }
}

export class TransportFailureError extends ConnectivityError {
  constructor(message = 'Transport failure occurred.') {
    super(message, 'TRANSPORT_FAILURE');
  }
}

export class InvalidSessionError extends ConnectivityError {
  constructor(message = 'Invalid or expired session.') {
    super(message, 'INVALID_SESSION');
  }
}

export class RateLimitExceededError extends ConnectivityError {
  constructor(message = 'Rate limit exceeded.') {
    super(message, 'RATE_LIMIT_EXCEEDED');
  }
}
