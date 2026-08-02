import { Event, EventListener } from '../interfaces';

/**
 * A decoupled Event System for broadcasting and listening to internal state changes.
 */
export class EventDispatcher {
  private listeners: Map<string, Set<EventListener>> = new Map();

  /**
   * Register a listener for a specific event type.
   * @param eventType - The type of event (e.g., 'WorkspaceCreated')
   * @param listener - The callback to execute.
   */
  public on<T = any>(eventType: string, listener: EventListener<T>): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(listener);
  }

  /**
   * Remove a registered listener.
   */
  public off<T = any>(eventType: string, listener: EventListener<T>): void {
    const eventListeners = this.listeners.get(eventType);
    if (eventListeners) {
      eventListeners.delete(listener);
      if (eventListeners.size === 0) {
        this.listeners.delete(eventType);
      }
    }
  }

  /**
   * Dispatch an event to all registered listeners.
   */
  public dispatch<T = any>(eventType: string, payload: T): void {
    const event: Event<T> = {
      type: eventType,
      timestamp: Date.now(),
      payload
    };

    const eventListeners = this.listeners.get(eventType);
    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          listener(event);
        } catch (err) {
          // Log errors but don't stop execution of other listeners
          console.error(`Error in listener for event ${eventType}:`, err);
        }
      });
    }

    // Also dispatch to a catch-all wildcard '*' if anyone is listening to everything
    const wildcardListeners = this.listeners.get('*');
    if (wildcardListeners) {
      wildcardListeners.forEach(listener => {
        try {
          listener(event);
        } catch (err) {
          console.error(`Error in wildcard listener for event ${eventType}:`, err);
        }
      });
    }
  }
}
