import { ILogger, LogEntry, LogSeverity } from '../interfaces/ILogger';

export class StructuredLogger implements ILogger {
  private log(severity: LogSeverity, entry: Omit<LogEntry, 'severity' | 'timestamp'>): void {
    const logEntry: LogEntry = {
      ...entry,
      severity,
      timestamp: new Date().toISOString()
    };
    
    // For W1 testing and console output. 
    // In future phases, this can write to a file or observability service.
    const logStr = JSON.stringify(logEntry);
    if (severity === 'ERROR' || severity === 'FATAL') {
      console.error(logStr);
    } else if (severity === 'WARN') {
      console.warn(logStr);
    } else {
      console.log(logStr);
    }
  }

  debug(entry: Omit<LogEntry, 'severity' | 'timestamp'>): void {
    this.log('DEBUG', entry);
  }
  info(entry: Omit<LogEntry, 'severity' | 'timestamp'>): void {
    this.log('INFO', entry);
  }
  warn(entry: Omit<LogEntry, 'severity' | 'timestamp'>): void {
    this.log('WARN', entry);
  }
  error(entry: Omit<LogEntry, 'severity' | 'timestamp'>): void {
    this.log('ERROR', entry);
  }
  fatal(entry: Omit<LogEntry, 'severity' | 'timestamp'>): void {
    this.log('FATAL', entry);
  }
}
