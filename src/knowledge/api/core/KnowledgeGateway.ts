import { SecurityResolver } from './SecurityResolver';
import { KnowledgeRequest } from '../v1/models/KnowledgeRequest';
import { KnowledgeResponse } from '../v1/models/KnowledgeResponse';
import { KnowledgeError } from '../v1/errors/KnowledgeError';
import { KnowledgeErrorCode } from '../v1/types/KnowledgeErrorCodes';
import { BaseKnowledgeAPI } from './BaseKnowledgeAPI';

export class KnowledgeGateway {
  private domains: Map<string, BaseKnowledgeAPI> = new Map();

  constructor(private securityResolver: SecurityResolver) {}

  public registerDomain(name: string, api: BaseKnowledgeAPI): void {
    this.domains.set(name.toLowerCase(), api);
  }

  public dispatch(domain: string, request: KnowledgeRequest): KnowledgeResponse<any> {
    try {
      this.securityResolver.resolveContext(request);

      const api = this.domains.get(domain.toLowerCase());
      if (!api) {
        throw new KnowledgeError(KnowledgeErrorCode.KNOWLEDGE_INVALID_REQUEST, `Unknown knowledge domain: ${domain}`);
      }

      return api.execute(request);
    } catch (err: any) {
      if (err instanceof KnowledgeError) {
        throw err;
      }
      
      // Mask arbitrary internal errors
      throw new KnowledgeError(KnowledgeErrorCode.KNOWLEDGE_QUERY_FAILED, "Internal Knowledge System Error");
    }
  }
}
