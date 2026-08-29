export type InformationRequestType =
  | 'MISSING_EVIDENCE'
  | 'MISSING_CONTEXT'
  | 'AMBIGUOUS_REQUIREMENT'
  | 'UNKNOWN_TARGET'
  | 'CONFLICTING_EVIDENCE'
  | 'STALE_KNOWLEDGE';

export interface InformationRequest {
  requestId: string;
  type: InformationRequestType;
  description: string;
  requestedResources?: string[];
}
