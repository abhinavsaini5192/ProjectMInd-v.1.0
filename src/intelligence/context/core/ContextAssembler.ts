import { ContextPlan } from '../models/ContextPlan';
import { ContextPackage, ContextSection } from '../models/ContextPackage';
import { ContextItem } from '../models/ContextItem';
import { IContextRetriever } from '../retrieval/ContextRetriever';
import { RelevanceRanker } from '../ranking/RelevanceRanker';
import { ContextDeduplicator } from '../ranking/ContextDeduplicator';
import { ContextBudgetManager } from './ContextBudgetManager';
import { ContextAssemblyError } from '../errors/ContextAssemblyError';

export class ContextAssembler {
  private ranker = new RelevanceRanker();
  private deduplicator = new ContextDeduplicator();
  private budgetManager = new ContextBudgetManager();

  constructor(private retrievers: IContextRetriever[]) {}

  public async assemble(plan: ContextPlan, modelContextWindow: number = 8192): Promise<ContextPackage> {
    try {
      const allRetrievedItems: ContextItem[] = [];

      // 1. Execute retrieval across registered retrievers matching requirements
      for (const req of plan.requirements) {
        for (const retriever of this.retrievers) {
          if (retriever.canHandle(req)) {
            const items = await retriever.retrieve(req, plan);
            allRetrievedItems.push(...items);
          }
        }
      }

      // 2. Deduplicate items and isolate conflicts
      const { deduplicatedItems, conflicts } = this.deduplicator.deduplicate(allRetrievedItems);

      // 3. Rank items deterministically with explicit references and multi-factor scores
      const rankedItems = this.ranker.rank(deduplicatedItems, plan);

      // 4. Calculate budget and apply priority-aware truncation
      const budget = this.budgetManager.calculateBudget(modelContextWindow);
      const { acceptedItems, totalTokensUsed } = this.budgetManager.applyBudget(rankedItems, budget);

      // 5. Structure into categorized sections
      const sections = this.buildSections(acceptedItems);

      return {
        packageId: `cpkg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        planId: plan.planId,
        taskId: plan.taskIntent,
        summary: `Context package with ${acceptedItems.length} items (${totalTokensUsed} tokens) for task: ${plan.taskIntent}`,
        items: acceptedItems,
        sections,
        conflicts,
        tokenEstimate: totalTokensUsed,
        budget,
        generatedAt: Date.now()
      };
    } catch (err: any) {
      throw new ContextAssemblyError(`Failed to assemble context package: ${err.message}`, { planId: plan.planId });
    }
  }

  private buildSections(items: ContextItem[]): ContextSection[] {
    const sectionMap = new Map<string, ContextItem[]>();

    for (const item of items) {
      const typeKey = item.type.toString();
      if (!sectionMap.has(typeKey)) {
        sectionMap.set(typeKey, []);
      }
      sectionMap.get(typeKey)!.push(item);
    }

    const sections: ContextSection[] = [];
    for (const [type, sectionItems] of sectionMap.entries()) {
      sections.push({
        title: this.formatSectionTitle(type),
        type,
        items: sectionItems
      });
    }

    return sections;
  }

  private formatSectionTitle(type: string): string {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}
