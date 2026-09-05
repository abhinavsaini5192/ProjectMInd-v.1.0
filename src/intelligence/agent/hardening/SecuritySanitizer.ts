import { AgentSecurityError } from '../errors/AgentSecurityError';

export class SecuritySanitizer {
  private static readonly INJECTION_PATTERNS: RegExp[] = [
    /ignore\s+(all\s+)?(previous|prior)\s+instructions/i,
    /disregard\s+(all\s+)?(previous|prior)\s+instructions/i,
    /system\s+override/i,
    /you\s+are\s+now\s+(in\s+)?(developer\s+mode|unrestricted\s+mode|dan\s+mode)/i,
    /disregard\s+(all\s+)?safety\s+guidelines/i,
    /bypass\s+(all\s+)?(safety|policy|guardrail)s?/i,
  ];

  private static readonly SECRET_PATTERNS: Array<{ regex: RegExp; replacement: string }> = [
    // AWS Access Key ID
    { regex: /(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/g, replacement: '[REDACTED_AWS_KEY]' },
    // JWT token
    { regex: /eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/g, replacement: '[REDACTED_JWT_TOKEN]' },
    // Private keys
    { regex: /-----BEGIN (?:[A-Z\s]+) PRIVATE KEY-----[\s\S]*?-----END (?:[A-Z\s]+) PRIVATE KEY-----/g, replacement: '[REDACTED_PRIVATE_KEY]' },
    // Generic API Key / Password assignment
    { regex: /((?:password|secret|api_key|apikey|token|auth_token)\s*[:=]\s*['"])([^'"]+)(['"])/gi, replacement: '$1[REDACTED_SECRET]$3' },
  ];

  /**
   * Check for prompt injection attempts in untrusted input
   */
  public static checkPromptInjection(input: string, strict: boolean = true): { detected: boolean; matches: string[] } {
    const matches: string[] = [];
    for (const pattern of this.INJECTION_PATTERNS) {
      const match = pattern.exec(input);
      if (match) {
        matches.push(match[0]);
      }
    }

    const detected = matches.length > 0;
    if (detected && strict) {
      throw new AgentSecurityError(
        `Potential prompt injection detected: "${matches.join(', ')}"`,
        'PROMPT_INJECTION',
        { matches }
      );
    }

    return { detected, matches };
  }

  /**
   * Redact sensitive secrets from text before sending to LLM or persisting in logs
   */
  public static redactSecrets(input: string): string {
    let sanitized = input;
    for (const { regex, replacement } of this.SECRET_PATTERNS) {
      sanitized = sanitized.replace(regex, replacement);
    }
    return sanitized;
  }

  /**
   * Delimit repository data with strict XML tags to prevent context poisoning
   */
  public static wrapRepositoryData(content: string, resourceUri: string): string {
    const sanitizedContent = this.redactSecrets(content);
    return `<repository-data resource="${encodeURI(resourceUri)}">\n${sanitizedContent}\n</repository-data>`;
  }
}
