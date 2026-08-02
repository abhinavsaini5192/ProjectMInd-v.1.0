/**
 * Defines the contract for any service that can be registered in the ProjectMind Kernel.
 */
export interface Service {
  /**
   * The unique name of the service (e.g., 'parser', 'memory-manager').
   */
  readonly name: string;
  
  /**
   * Initializes the service. 
   */
  initialize(): Promise<void>;
  
  /**
   * Shuts down the service cleanly.
   */
  shutdown(): Promise<void>;
}

/**
 * Base Event structure for the EventDispatcher.
 */
export interface Event<T = any> {
  type: string;
  timestamp: number;
  payload: T;
}

/**
 * Listener function signature for events.
 */
export type EventListener<T = any> = (event: Event<T>) => void;
export * from './Plugin';
