import { ContextItem } from '../models/ContextItem';

export class ContextRanker {
  public rank(items: ContextItem[]): ContextItem[] {
    return items.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }
}
