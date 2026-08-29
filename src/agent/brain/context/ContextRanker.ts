export class ContextRanker {
  public rank(nodes: any[]): any[] {
    // Priority: Task Info (1) > Direct Symbols (2) > Dependencies (3) > Architecture (4) > Memory (5)
    return nodes.sort((a, b) => {
       const priorityA = a.priority || 99;
       const priorityB = b.priority || 99;
       return priorityA - priorityB;
    });
  }
}
