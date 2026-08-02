import { RateLimitExceededError } from '../errors/ConnectivityErrors';

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

/**
 * Manages rate limiting for AI requests.
 */
export class RateLimiter {
  private userLimits: Map<string, RateLimitInfo> = new Map();
  private readonly maxRequestsPerMinute: number;

  constructor(maxRequestsPerMinute = 600) {
    this.maxRequestsPerMinute = maxRequestsPerMinute;
  }

  /**
   * Checks and updates rate limits for a user.
   * Throws if limit exceeded.
   */
  public checkLimit(userId: string): void {
    const now = Date.now();
    let info = this.userLimits.get(userId);
    
    if (!info || now > info.resetTime) {
      info = {
        count: 0,
        resetTime: now + 60000 // 1 minute
      };
      this.userLimits.set(userId, info);
    }
    
    if (info.count >= this.maxRequestsPerMinute) {
      throw new RateLimitExceededError(`Rate limit exceeded for user ${userId}. Try again later.`);
    }
    
    info.count++;
  }
}
