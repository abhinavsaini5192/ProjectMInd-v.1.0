import { KnowledgeErrorCode } from '../types/KnowledgeErrorCodes';

export class KnowledgeError extends Error {
  constructor(public code: KnowledgeErrorCode, message: string) {
    super(message);
    this.name = 'KnowledgeError';
  }
}
