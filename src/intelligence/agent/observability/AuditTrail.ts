import { randomUUID } from 'crypto';

export type AuditCategory =
  | 'REQUEST'
  | 'CONTEXT'
  | 'REASONING'
  | 'PLANNING'
  | 'EXECUTION'
  | 'VERIFICATION'
  | 'FEEDBACK'
  | 'SECURITY'
  | 'ERROR';

export type AuditActor = 'SYSTEM' | 'AGENT' | 'SLM' | 'USER' | 'ORCHESTRATOR';

export type AuditStatus = 'STARTED' | 'COMPLETED' | 'FAILED' | 'SKIPPED' | 'INFO';

export interface AuditEntry {
  id: string;
  timestamp: number;
  requestId?: string;
  taskId?: string;
  cycleIndex?: number;
  category: AuditCategory;
  action: string;
  actor: AuditActor;
  status: AuditStatus;
  details?: Record<string, any>;
}

export class AuditTrail {
  private entries: AuditEntry[] = [];
  private readonly maxEntries: number;

  constructor(maxEntries: number = 10000) {
    this.maxEntries = maxEntries;
  }

  public record(params: Omit<AuditEntry, 'id' | 'timestamp'>): AuditEntry {
    const entry: AuditEntry = {
      id: randomUUID(),
      timestamp: Date.now(),
      ...params,
    };

    this.entries.push(entry);

    if (this.entries.length > this.maxEntries) {
      this.entries.shift(); // Evict oldest
    }

    return entry;
  }

  public getEntriesForTask(taskId: string): AuditEntry[] {
    return this.entries.filter((e) => e.taskId === taskId);
  }

  public getEntriesForRequest(requestId: string): AuditEntry[] {
    return this.entries.filter((e) => e.requestId === requestId);
  }

  public getRecent(count: number = 100): AuditEntry[] {
    return this.entries.slice(-count);
  }

  public getAll(): AuditEntry[] {
    return [...this.entries];
  }

  public clear(): void {
    this.entries = [];
  }

  public exportAuditLog(): string {
    return JSON.stringify(this.entries, null, 2);
  }
}
