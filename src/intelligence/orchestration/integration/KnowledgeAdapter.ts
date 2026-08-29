export class KnowledgeAdapter {
  constructor(private knowledgeGraph?: any) {}

  public async refreshKnowledge(): Promise<void> {
    if (this.knowledgeGraph?.sync) {
      await this.knowledgeGraph.sync();
    }
  }
}
