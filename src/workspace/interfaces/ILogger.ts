export type LogSeverity = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';

export interface LogEntry {
  timestamp: string;
  component: string;
  operation: string;
  correlationId?: string;
  repositoryId?: string;
  workspaceId?: string;
  durationMs?: number;
  severity: LogSeverity;
  message: string;
  details?: Record<string, any>;
}

export interface ILogger {
  debug(entry: Omit<LogEntry, 'severity' | 'timestamp'>): void;
  info(entry: Omit<LogEntry, 'severity' | 'timestamp'>): void;
  warn(entry: Omit<LogEntry, 'severity' | 'timestamp'>): void;
  error(entry: Omit<LogEntry, 'severity' | 'timestamp'>): void;
  fatal(entry: Omit<LogEntry, 'severity' | 'timestamp'>): void;
}

export const ILoggerToken = Symbol('ILogger');
