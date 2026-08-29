import * as crypto from 'crypto';

export class PatchGenerator {
  public generateUnifiedDiff(original: string, modified: string, file: string): string {
    // Simple mock diff generator
    const origLines = original.split('\n');
    const modLines = modified.split('\n');
    
    let diff = `--- a/${file}\n+++ b/${file}\n`;
    
    // Naive diff for demonstration
    for (let i = 0; i < Math.max(origLines.length, modLines.length); i++) {
       if (origLines[i] !== modLines[i]) {
          if (origLines[i] !== undefined) diff += `- ${origLines[i]}\n`;
          if (modLines[i] !== undefined) diff += `+ ${modLines[i]}\n`;
       } else {
          diff += `  ${origLines[i]}\n`;
       }
    }
    return diff;
  }

  public hashContent(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }
}
