import { IQuery, IQueryResult } from '../models/IQuery';
import { SecurityScope } from '../models/SecurityScope';

export class QueryValidator {
  /**
   * Validates structure and applies heuristic security constraints.
   */
  public validate(query: IQuery): void {
    if (!query.entity) throw new Error('Query missing entity');
    if (!query.operation) throw new Error('Query missing operation');

    // Simulate SENSITIVE data redaction/blocking
    if (query.filters) {
      for (const [key, value] of Object.entries(query.filters)) {
        if (typeof value === 'string') {
          const lower = value.toLowerCase();
          if (lower.includes('secret') || lower.includes('password') || lower.includes('key')) {
             throw new Error(`Security Violation: Attempted to query sensitive data [${key}]`);
          }
        }
      }
    }
  }

  public sanitizeResult(result: IQueryResult): void {
     // Check the result data for sensitive fields and strip them
     if (result.data) {
       this.redact(result.data);
     }
  }

  private redact(obj: any): void {
    if (Array.isArray(obj)) {
      for (const item of obj) this.redact(item);
    } else if (typeof obj === 'object' && obj !== null) {
      for (const key of Object.keys(obj)) {
        const lowerKey = key.toLowerCase();
        if (lowerKey.includes('secret') || lowerKey.includes('password') || lowerKey.includes('key')) {
          obj[key] = '[REDACTED]';
        } else {
          this.redact(obj[key]);
        }
      }
    }
  }
}
