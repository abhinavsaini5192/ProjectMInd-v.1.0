export class WorkspaceAdapter {
  public filterSecrets(content: string): string {
    let text = content;
    text = text.replace(/AKIA[0-9A-Z]{16}/g, '[REDACTED_AWS_KEY]');
    text = text.replace(/ey[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/g, '[REDACTED_JWT_TOKEN]');
    text = text.replace(/(password|secret|apiKey)\s*[:=]\s*['"](?!\[REDACTED_)[^'"]+['"]/gi, '$1 = "[REDACTED_SECRET]"');
    return text;
  }

  public wrapUntrustedData(content: string, resourceId: string): string {
    const cleanContent = this.filterSecrets(content);
    return `<repository-data resource="${resourceId}">\n${cleanContent}\n</repository-data>`;
  }
}
