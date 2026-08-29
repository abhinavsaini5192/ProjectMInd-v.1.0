import { SecurityDecision } from '../models/SecurityDecision';
import { KernelEventDispatcher } from '../../../kernel/core/KernelEventDispatcher';
import { SecurityEventType } from './SecurityEvent';

export class SecurityAuditLogger {
  constructor(private dispatcher: KernelEventDispatcher) {}

  public logDecision(agentId: string, taskId: string, planId: string, decision: SecurityDecision, parameters: Record<string, any>): void {
    
    // Redact sensitive secrets from parameters
    const redactedParams = this.redactSecrets(parameters);

    const payload = {
      timestamp: decision.timestamp,
      agentId,
      taskId,
      planId,
      actionId: decision.actionId,
      decision: decision.decision,
      risk: decision.risk,
      reasons: decision.reasons,
      policies: decision.matchedPolicies.map(p => p.reason),
      permissions: decision.requiredPermissions,
      parameters: redactedParams
    };

    let eventType = SecurityEventType.ACTION_EVALUATED;
    if (decision.decision === 'ALLOW') eventType = SecurityEventType.ACTION_ALLOWED;
    else if (decision.decision === 'DENY') eventType = SecurityEventType.ACTION_DENIED;
    else if (decision.decision === 'REQUIRE_APPROVAL') eventType = SecurityEventType.ACTION_APPROVAL_REQUIRED;

    this.dispatcher.publish(eventType, payload);
  }

  private redactSecrets(params: Record<string, any>): Record<string, any> {
    const redacted = { ...params };
    const sensitiveKeys = ['password', 'secret', 'token', 'key', 'credential', 'api_key'];

    for (const key of Object.keys(redacted)) {
       const lowerKey = key.toLowerCase();
       if (sensitiveKeys.some(s => lowerKey.includes(s))) {
          redacted[key] = '[REDACTED]';
       }
    }
    return redacted;
  }
}
