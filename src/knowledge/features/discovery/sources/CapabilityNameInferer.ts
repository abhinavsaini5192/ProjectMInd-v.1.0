export class CapabilityNameInferer {
  private static readonly CAPABILITY_PATTERNS: Array<{ regex: RegExp; capability: string }> = [
    { regex: /(?:^|[_\-/.\s])(?:auth\w*|login\w*|logout\w*|session\w*|jwt\w*|token\w*|credential\w*|oauth\w*|password\w*)(?:[_\-/.\s]|$)/i, capability: 'Authentication' },
    { regex: /(?:^|[_\-/.\s])(?:pay\w*|stripe\w*|invoice\w*|billing\w*|checkout\w*|subscription\w*|charge\w*)(?:[_\-/.\s]|$)/i, capability: 'Payment Processing' },
    { regex: /(?:^|[_\-/.\s])(?:user\w*|profile\w*|account\w*|member\w*|avatar\w*)(?:[_\-/.\s]|$)/i, capability: 'User Management' },
    { regex: /(?:^|[_\-/.\s])(?:notif\w*|alert\w*|email\w*|sms\w*|webhook\w*|push\w*)(?:[_\-/.\s]|$)/i, capability: 'Notifications' },
    { regex: /(?:^|[_\-/.\s])(?:search\w*|indexer\w*|query\w*|filter\w*)(?:[_\-/.\s]|$)/i, capability: 'Search & Query' },
    { regex: /(?:^|[_\-/.\s])(?:report\w*|analytics\w*|metric\w*|telemetry\w*|audit\w*)(?:[_\-/.\s]|$)/i, capability: 'Reporting & Analytics' },
    { regex: /(?:^|[_\-/.\s])(?:order\w*|cart\w*|basket\w*|inventory\w*|item\w*)(?:[_\-/.\s]|$)/i, capability: 'Order & Inventory' },
  ];

  /**
   * Infer normalized capability name from raw identifier, path, or string
   */
  public static infer(text: string): string | null {
    if (!text) return null;
    const cleanText = text.trim();
    const spaced = cleanText.replace(/([a-z])([A-Z])/g, '$1 $2');

    for (const { regex, capability } of this.CAPABILITY_PATTERNS) {
      if (regex.test(cleanText) || regex.test(spaced)) {
        return capability;
      }
    }

    // Generic fallback: if camelCase or PascalCase like "FileStorageService", derive "File Storage"
    const words = cleanText.replace(/([A-Z])/g, ' $1').replace(/[_\-./]/g, ' ').trim().split(/\s+/);
    const filtered = words.filter(w => !['Service', 'Controller', 'Engine', 'Manager', 'Handler', 'Util', 'Utils', 'Test', 'Spec'].includes(w));
    const firstWord = filtered[0];
    if (filtered.length > 0 && firstWord && firstWord.length > 2) {
      return filtered.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    }

    return null;
  }
}
