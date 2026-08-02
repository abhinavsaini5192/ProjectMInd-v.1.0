export interface AIRequest<T = any> {
  id: string;
  type: string;
  payload: T;
  sessionId?: string;
  timestamp: number;
}

export interface AIResponse<T = any> {
  id: string;
  requestId: string;
  status: 'success' | 'error';
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: number;
}

export interface SessionState {
  id: string;
  repository: string;
  workspace: string;
  contextBudget: number;
  memoryUsage: number;
  createdAt: number;
  lastActive: number;
}

export interface SessionDetails {
  state: SessionState;
  userId: string;
  role: string;
}

export interface CapabilityProvider {
  name: string;
  version: string;
  features: string[];
}

export interface TransportAdapter {
  start(): Promise<void>;
  stop(): Promise<void>;
  onMessage(handler: (request: AIRequest) => Promise<AIResponse>): void;
}

export interface ProviderAdapter {
  translateRequest(rawPayload: any): AIRequest;
  translateResponse(response: AIResponse): any;
}
