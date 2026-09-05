export type InformationRequestType =
  | 'FILE'
  | 'SYMBOL'
  | 'MODULE'
  | 'DEPENDENCY'
  | 'CONFIGURATION'
  | 'TEST'
  | 'DIFF'
  | 'METRICS';

export type InformationRequestUrgency = 'LOW' | 'MEDIUM' | 'HIGH';

export interface InformationRequest {
  requestId: string;
  type: InformationRequestType;
  target: string;
  reason: string;
  urgency: InformationRequestUrgency;
  metadata?: Record<string, any>;
}

export interface InformationResponse {
  requestId: string;
  found: boolean;
  content?: string;
  metadata?: Record<string, any>;
  error?: string;
}
