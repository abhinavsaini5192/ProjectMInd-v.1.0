import { KnowledgeRequest } from '../v1/models/KnowledgeRequest';
import { KnowledgeError } from '../v1/errors/KnowledgeError';
import { KnowledgeErrorCode } from '../v1/types/KnowledgeErrorCodes';

export class SecurityResolver {
  public resolveContext(request: KnowledgeRequest): void {
    if (!request.repositoryId) {
      throw new KnowledgeError(KnowledgeErrorCode.KNOWLEDGE_INVALID_REQUEST, "Missing repositoryId in request.");
    }

    // Mock isolation check
    // In a real system, this would look up the Workspace and ensure the current user has access
    if (request.repositoryId === 'restricted_repo') {
      throw new KnowledgeError(KnowledgeErrorCode.KNOWLEDGE_ACCESS_DENIED, "Access denied to restricted repository.");
    }

    if (request.repositoryId === 'unknown_repo') {
      throw new KnowledgeError(KnowledgeErrorCode.KNOWLEDGE_REPOSITORY_NOT_FOUND, `Repository not found: ${request.repositoryId}`);
    }
  }
}
