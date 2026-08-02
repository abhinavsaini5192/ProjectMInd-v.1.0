import { ProjectMindKernel } from '../../kernel/ProjectMindKernel';

export interface StreamEvent<T = any> {
  type: string;
  payload: T;
  timestamp: number;
}

export type StreamCallback<T = any> = (event: StreamEvent<T>) => void;

/**
 * Handles streaming updates to AI clients.
 */
export class StreamingEngine {
  constructor(private readonly kernel: ProjectMindKernel) {}
  
  /**
   * Subscribes a client to a specific event stream.
   * Uses the Kernel's EventDispatcher under the hood.
   */
  public subscribe<T>(eventType: string, callback: StreamCallback<T>): void {
    this.kernel.eventDispatcher.on(eventType, callback);
  }
  
  /**
   * Unsubscribes a client from a specific event stream.
   */
  public unsubscribe<T>(eventType: string, callback: StreamCallback<T>): void {
    this.kernel.eventDispatcher.off(eventType, callback);
  }
}
