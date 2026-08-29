export class AgentInitializationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AgentInitializationError';
  }
}

export class InvalidAgentStateTransition extends Error {
  constructor(public fromState: string, public toState: string) {
    super(`Cannot transition agent from ${fromState} to ${toState}`);
    this.name = 'InvalidAgentStateTransition';
  }
}

export class AgentTaskError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AgentTaskError';
  }
}

export class AgentCancelledError extends Error {
  constructor(message: string = 'Agent execution was cancelled') {
    super(message);
    this.name = 'AgentCancelledError';
  }
}

export class BrainUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BrainUnavailableError';
  }
}

export class AgentRuntimeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AgentRuntimeError';
  }
}
