export interface PromptTemplate {
  templateId: string;
  version: string;
  description: string;
  render(params: Record<string, any>): string;
}
