import { TransportAdapter, AIRequest, AIResponse } from '../interfaces';

export abstract class BaseTransport implements TransportAdapter {
  protected handler?: (request: AIRequest) => Promise<AIResponse>;

  public onMessage(handler: (request: AIRequest) => Promise<AIResponse>): void {
    this.handler = handler;
  }

  public abstract start(): Promise<void>;
  public abstract stop(): Promise<void>;
}

export class LocalAPITransport extends BaseTransport {
  public async start(): Promise<void> {
    console.log('Local API Transport started.');
  }

  public async stop(): Promise<void> {
    console.log('Local API Transport stopped.');
  }

  /**
   * Mocks an incoming request for local testing.
   */
  public async simulateRequest(request: AIRequest): Promise<AIResponse> {
    if (!this.handler) throw new Error('No handler registered.');
    return this.handler(request);
  }
}

export class RESTTransport extends BaseTransport {
  public async start(): Promise<void> {
    console.log('REST Transport started on port 3000 (Mock).');
  }

  public async stop(): Promise<void> {
    console.log('REST Transport stopped.');
  }
}

export class WebSocketTransport extends BaseTransport {
  public async start(): Promise<void> {
    console.log('WebSocket Transport started (Mock).');
  }

  public async stop(): Promise<void> {
    console.log('WebSocket Transport stopped.');
  }
}
