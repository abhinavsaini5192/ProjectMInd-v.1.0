import { KernelState } from '../models/KernelState';
import { KernelEventDispatcher } from './KernelEventDispatcher';
import { KernelEventType } from '../types/KernelEvents';
import { ILogger } from '../../workspace/interfaces/ILogger';

export class KernelLifecycleManager {
  private state: KernelState = KernelState.Stopped;

  constructor(private dispatcher: KernelEventDispatcher, private logger: ILogger) {}

  public async boot(): Promise<void> {
    this.state = KernelState.Booting;
    this.logger.info({ component: 'KernelLifecycle', operation: 'boot', message: 'Kernel booting...', severity: 'INFO' });
    
    // Boot sequence (Initialize Storage -> Graph -> Intelligence) goes here
    
    this.state = KernelState.Running;
    this.dispatcher.publish(KernelEventType.SystemBoot, { timestamp: Date.now() });
  }

  public async shutdown(): Promise<void> {
    this.state = KernelState.ShuttingDown;
    this.logger.info({ component: 'KernelLifecycle', operation: 'shutdown', message: 'Kernel shutting down...', severity: 'INFO' });
    
    this.dispatcher.publish(KernelEventType.SystemShutdown, { timestamp: Date.now() });
    this.state = KernelState.Stopped;
  }

  public getState(): KernelState {
    return this.state;
  }
}
