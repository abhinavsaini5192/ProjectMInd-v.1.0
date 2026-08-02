import { PermissionDeniedError } from '../errors/ConnectivityErrors';

export interface AuthContext {
  userId: string;
  role: string;
  isAuthenticated: boolean;
}

/**
 * Basic Authentication and Authorization manager.
 */
export class AuthManager {
  /**
   * Validates a token or API key.
   */
  public authenticate(token: string): AuthContext {
    // In a real system, this would verify JWT or check a database for the API key.
    if (!token || token === 'invalid') {
      throw new PermissionDeniedError('Invalid or missing authentication token.');
    }
    
    // Mock user context
    return {
      userId: 'user_123',
      role: 'developer',
      isAuthenticated: true
    };
  }

  /**
   * Checks if a role is authorized for a specific action.
   */
  public authorize(role: string, requiredRole: string): boolean {
    if (role === 'admin') return true;
    return role === requiredRole;
  }
}
