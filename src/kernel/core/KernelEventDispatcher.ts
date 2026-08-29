import { IKernelEventDispatcher } from '../interfaces/IKernel';
import EventEmitter from 'events';

export class KernelEventDispatcher implements IKernelEventDispatcher {
  private emitter = new EventEmitter();

  public publish(event: string, payload: any): void {
    // In a distributed system, this might push to Redis or Kafka.
    // For now, it's an in-memory event bus.
    this.emitter.emit(event, payload);
  }

  public subscribe(event: string, handler: (payload: any) => void): void {
    this.emitter.on(event, handler);
  }

  public unsubscribe(event: string, handler: (payload: any) => void): void {
    this.emitter.off(event, handler);
  }
}
