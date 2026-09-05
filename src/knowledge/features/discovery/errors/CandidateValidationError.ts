export class CandidateValidationError extends Error {
  constructor(public candidateId: string, public issues: string[]) {
    super(`CandidateValidationError: Candidate "${candidateId}" failed validation: ${issues.join('; ')}`);
    this.name = 'CandidateValidationError';
  }
}
