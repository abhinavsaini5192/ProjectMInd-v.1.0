import { EventEmitter } from 'events';
import { IEventBus, EventHandler } from '../interfaces/IEventBus';
import { ProjectMindEvent } from '../types/WorkspaceEvents';

export class NodeEventBus implements IEventBus {
  private emitter: EventEmitter;

  constructor() {
    this.emitter = new EventEmitter();
  }

  publish<T>(eventName: string, payload: T): void {
    const event: ProjectMindEvent<T> = {
      name: eventName,
      payload,
      timestamp: new Date().toISOString(),
    };
    this.emitter.emit(eventName, event);
  }

  subscribe<T>(eventName: string, handler: EventHandler<T>): void {
    this.emitter.on(eventName, handler);
  }

  unsubscribe<T>(eventName: string, handler: EventHandler<T>): void {
    this.emitter.off(eventName, handler);
  }
}
