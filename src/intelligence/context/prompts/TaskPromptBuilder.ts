export class TaskPromptBuilder {
  public static readonly VERSION = '1.0';

  public buildTaskPrompt(taskIntent: string, constraints: string[] = []): string {
    const lines = [
      '## CURRENT TASK',
      `Objective: ${taskIntent}`,
      ''
    ];

    if (constraints.length > 0) {
      lines.push('## CONSTRAINTS');
      for (const c of constraints) {
        lines.push(`- ${c}`);
      }
      lines.push('');
    }

    lines.push('Formulate the required architectural and code modification decisions based strictly on the provided context.');
    return lines.join('\n');
  }
}
