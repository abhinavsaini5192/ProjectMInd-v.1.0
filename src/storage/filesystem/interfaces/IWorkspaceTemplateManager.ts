export interface IWorkspaceTemplateManager {
  generateMetadataTemplate(workspaceId: string, name: string): any;
  generatePointerTemplate(repositoryId: string): any;
  generateConfigTemplate(): any;
  generateWorkspaceReadme(workspaceId: string): string;
}

export const IWorkspaceTemplateManagerToken = Symbol('IWorkspaceTemplateManager');
