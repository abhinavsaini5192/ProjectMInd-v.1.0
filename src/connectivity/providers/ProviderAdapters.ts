import { ProviderAdapter, AIRequest, AIResponse } from '../interfaces';

/**
 * Adapter for translating Claude specific payloads to standard AIRequest.
 */
export class ClaudeAdapter implements ProviderAdapter {
  public translateRequest(rawPayload: any): AIRequest {
    // Example translation
    return {
      id: rawPayload.message_id || `req_${Date.now()}`,
      type: rawPayload.intent || 'build_context',
      payload: rawPayload.content,
      timestamp: Date.now()
    };
  }

  public translateResponse(response: AIResponse): any {
    return {
      status: response.status,
      response_data: response.data,
      error_info: response.error
    };
  }
}

/**
 * Adapter for translating Cursor specific payloads to standard AIRequest.
 */
export class CursorAdapter implements ProviderAdapter {
  public translateRequest(rawPayload: any): AIRequest {
    return {
      id: rawPayload.req_id || `req_${Date.now()}`,
      type: rawPayload.action || 'query_repository',
      payload: rawPayload.params,
      timestamp: Date.now()
    };
  }

  public translateResponse(response: AIResponse): any {
    return {
      ok: response.status === 'success',
      result: response.data,
      error: response.error
    };
  }
}
