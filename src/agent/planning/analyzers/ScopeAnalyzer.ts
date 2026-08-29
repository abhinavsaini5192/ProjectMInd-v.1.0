import { ContextPackage } from '../../../intelligence/fusion/models/ContextPackage';

export class ScopeAnalyzer {
  
  public analyze(context: ContextPackage): string[] {
    // Determine the blast radius based on the Brain's context package.
    const allEntities = new Set([
      ...context.primaryContext,
      ...context.secondaryContext,
      ...context.architecture
    ]);

    return Array.from(allEntities);
  }
}
