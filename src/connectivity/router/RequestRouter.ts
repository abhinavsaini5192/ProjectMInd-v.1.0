import { AIRequest, AIResponse } from '../interfaces';
import { ProjectMindKernel } from '../../kernel/ProjectMindKernel';
import { ConnectivityError } from '../errors/ConnectivityErrors';

/**
 * Routes AI requests to the appropriate Kernel services.
 */
export class RequestRouter {
  constructor(private readonly kernel: ProjectMindKernel) {}

  /**
   * Dispatches a request and returns the response.
   */
  public async route(request: AIRequest): Promise<AIResponse> {
    try {
      const responseData = await this.handleRequest(request);
      return {
        id: `resp_${Math.random().toString(36).substring(2, 9)}`,
        requestId: request.id,
        status: 'success',
        data: responseData,
        timestamp: Date.now()
      };
    } catch (error: any) {
      let code = 'INTERNAL_ERROR';
      if (error instanceof ConnectivityError) {
        code = error.code || code;
      }
      
      return {
        id: `resp_${Math.random().toString(36).substring(2, 9)}`,
        requestId: request.id,
        status: 'error',
        error: {
          code,
          message: error.message || 'An unknown error occurred.'
        },
        timestamp: Date.now()
      };
    }
  }

  private async handleRequest(request: AIRequest): Promise<any> {
    switch (request.type) {
      case 'ping':
        return { message: 'pong' };
        
      case 'build_context':
        // Mock routing to ContextEngine
        return { context: 'Mocked context package', tokenCount: 50 };
        
      case 'query_repository':
        return { files: ['src/app.ts', 'package.json'] };
        
      case 'query_graph':
        // Mock routing to KnowledgeGraph
        return { nodes: [], edges: [] };
        
      case 'update_memory':
        // Mock memory update
        return { success: true };
        
      default:
        throw new ConnectivityError(`Unsupported request type: ${request.type}`, 'UNSUPPORTED_REQUEST');
    }
  }
}
