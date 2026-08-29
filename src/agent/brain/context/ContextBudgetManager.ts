export class ContextBudgetManager {
  private MAX_TOKENS = 4000;

  public truncate(contextNodes: any[]): any[] {
    let currentTokens = 0;
    const truncated: any[] = [];

    // Assuming contextNodes are already ranked by ContextRanker
    for (const node of contextNodes) {
       // Mock token estimation: 1 char = 0.25 tokens
       const estimatedTokens = Math.ceil(JSON.stringify(node).length * 0.25);
       
       if (currentTokens + estimatedTokens <= this.MAX_TOKENS) {
          truncated.push(node);
          currentTokens += estimatedTokens;
       } else {
          // Budget exhausted, discard lower priority nodes
          break;
       }
    }

    return truncated;
  }
}
