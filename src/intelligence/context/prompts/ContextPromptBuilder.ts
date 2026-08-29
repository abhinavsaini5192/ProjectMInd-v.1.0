import { ContextPackage } from '../models/ContextPackage';

export class ContextPromptBuilder {
  public static readonly VERSION = '1.0';

  public buildContextPrompt(pkg: ContextPackage): string {
    const lines: string[] = [
      '<PROJECT_CONTEXT>',
      `<!-- Context Package ID: ${pkg.packageId} | Estimated Tokens: ${pkg.tokenEstimate} -->`
    ];

    for (const section of pkg.sections) {
      const tag = section.type.toUpperCase();
      lines.push(`<${tag}>`);
      
      for (const item of section.items) {
        const trust = item.sources[0]?.trustLevel || 'UNKNOWN';
        const srcId = item.sources[0]?.sourceId || 'unknown';
        lines.push(`  [Trust: ${trust} | Source: ${srcId}]`);
        lines.push(`  ${item.content}`);
      }
      
      lines.push(`</${tag}>`);
    }

    if (pkg.conflicts && pkg.conflicts.length > 0) {
      lines.push('<CONTEXT_CONFLICTS>');
      for (const conflict of pkg.conflicts) {
        lines.push(`  [Severity: ${conflict.severity}] Topic: ${conflict.topic} - ${conflict.description}`);
      }
      lines.push('</CONTEXT_CONFLICTS>');
    }

    lines.push('</PROJECT_CONTEXT>');
    return lines.join('\n');
  }
}
