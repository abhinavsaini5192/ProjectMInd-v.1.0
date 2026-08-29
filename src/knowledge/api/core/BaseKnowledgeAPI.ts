import { QueryEngine } from '../../query/core/QueryEngine';
import { KnowledgeRequest } from '../v1/models/KnowledgeRequest';
import { KnowledgeResponse } from '../v1/models/KnowledgeResponse';
import { IQuery } from '../../query/models/IQuery';
import { KnowledgeError } from '../v1/errors/KnowledgeError';
import { KnowledgeErrorCode } from '../v1/types/KnowledgeErrorCodes';
import crypto from 'crypto';

export abstract class BaseKnowledgeAPI {
  constructor(protected queryEngine: QueryEngine, protected entityName: string) {}

  public execute(request: KnowledgeRequest): KnowledgeResponse<any> {
    try {
      // Map API request to internal IQuery
      const query: IQuery = {
        entity: this.entityName as any,
        operation: request.operation,
        filters: request.parameters,
        include: request.include,
        snapshotId: request.snapshotId,
        repositoryId: request.repositoryId
      };

      const qResult = this.queryEngine.query(query);

      return {
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
        repositoryId: request.repositoryId,
        snapshotId: qResult.snapshotId,
        data: qResult.data,
        metadata: {
          trust: {
            score: 0.98, // Mock integration with L2.10 ValidationEngine
            validated: true,
            lastValidated: new Date().toISOString(),
            validationVersion: '1.0'
          }
        },
        knowledgeVersion: qResult.knowledgeVersion,
        generatedAt: qResult.generatedAt,
        confidence: qResult.confidence,
        sources: qResult.sources,
        explanation: qResult.explanation
      };
    } catch (err: any) {
      // Intercept and wrap QueryEngine errors
      if (err.message.includes('Security Violation')) {
        throw new KnowledgeError(KnowledgeErrorCode.KNOWLEDGE_ACCESS_DENIED, err.message);
      }
      if (err.message.includes('No handler registered')) {
        throw new KnowledgeError(KnowledgeErrorCode.KNOWLEDGE_INVALID_REQUEST, err.message);
      }
      
      throw new KnowledgeError(KnowledgeErrorCode.KNOWLEDGE_QUERY_FAILED, `Query execution failed: ${err.message}`);
    }
  }
}
