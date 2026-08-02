import { ProjectMindKernel } from '../kernel/ProjectMindKernel';
import { SessionManager } from './session/SessionManager';
import { RequestRouter } from './router/RequestRouter';
import { CapabilityDiscovery } from './discovery/CapabilityDiscovery';
import { StreamingEngine } from './streaming/StreamingEngine';
import { AuthManager } from './auth/AuthManager';
import { RateLimiter } from './rate_limit/RateLimiter';
import { TelemetryTracker } from './telemetry/TelemetryTracker';
import { TransportAdapter, AIRequest, AIResponse } from './interfaces';

/**
 * The main orchestrator for the AI Connectivity Layer.
 * Wraps sessions, routing, auth, telemetry, and transports.
 */
export class ConnectivityLayer {
  public readonly sessionManager = new SessionManager();
  public readonly requestRouter: RequestRouter;
  public readonly capabilityDiscovery = new CapabilityDiscovery();
  public readonly streamingEngine: StreamingEngine;
  public readonly authManager = new AuthManager();
  public readonly rateLimiter = new RateLimiter();
  public readonly telemetryTracker = new TelemetryTracker();

  private transports: TransportAdapter[] = [];

  constructor(private readonly kernel: ProjectMindKernel) {
    this.requestRouter = new RequestRouter(kernel);
    this.streamingEngine = new StreamingEngine(kernel);
  }

  /**
   * Registers and starts a transport adapter (e.g. REST, WebSockets, Local API).
   */
  public async addTransport(transport: TransportAdapter): Promise<void> {
    transport.onMessage(this.handleIncomingMessage.bind(this));
    await transport.start();
    this.transports.push(transport);
  }

  /**
   * Gracefully shuts down all transports and active sessions.
   */
  public async shutdown(): Promise<void> {
    for (const transport of this.transports) {
      await transport.stop();
    }
    // Cleanup any other resources if necessary
  }

  /**
   * Handles incoming AIRequest objects from any transport.
   * Performs authentication, rate limiting, and routing.
   */
  private async handleIncomingMessage(request: AIRequest): Promise<AIResponse> {
    this.telemetryTracker.trackRequest(request.type);

    try {
      // 1. Session & Auth Validation
      // In a real system, the request would carry a token or session ID
      if (request.sessionId) {
        const session = this.sessionManager.getSession(request.sessionId);
        // 2. Rate Limiting
        this.rateLimiter.checkLimit(session.userId);
      }

      // 3. Routing
      const response = await this.requestRouter.route(request);

      if (response.status === 'success' && request.type === 'build_context') {
         // Mock telemetry for context size
         this.telemetryTracker.trackContextGenerated(1024);
      } else if (response.status === 'error') {
         this.telemetryTracker.trackError(response.error?.code || 'UNKNOWN');
      }

      return response;
    } catch (error: any) {
      this.telemetryTracker.trackError('AUTH_OR_RATE_LIMIT');
      return {
        id: `resp_${Date.now()}`,
        requestId: request.id,
        status: 'error',
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: error.message
        },
        timestamp: Date.now()
      };
    }
  }
}
