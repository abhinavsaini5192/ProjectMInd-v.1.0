import { ITokenEstimator } from './ITokenEstimator';

export class ApproximateTokenEstimator implements ITokenEstimator {
  /**
   * Approximate token count using standard 4 characters per token heuristic
   * with safety margin for punctuation and code formatting.
   */
  public estimateTokens(text: string): number {
    if (!text || text.length === 0) {
      return 0;
    }
    // Base estimate: roughly 4 chars per token for code/text, rounded up
    return Math.ceil(text.length / 3.8);
  }
}
