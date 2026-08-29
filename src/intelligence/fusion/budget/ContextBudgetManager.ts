import { ContextBudget } from '../models/ContextPackage';
import { FusedEntity } from '../models/FusionModels';

export class ContextBudgetManager {
  
  public trimToBudget(entities: FusedEntity[], budget: ContextBudget): FusedEntity[] {
    // Only consider entities that passed the selection threshold
    let selected = entities.filter(e => e.selected);
    
    // Trim by Max Entities
    if (selected.length > budget.maxEntities) {
       selected = selected.slice(0, budget.maxEntities);
    }

    // In a real implementation, we would also trim by token count and file count by looking up the actual file sizes.
    // For now, we enforce maxFiles = maxEntities (assuming 1 entity = 1 file for mock simplicity)
    if (selected.length > budget.maxFiles) {
       selected = selected.slice(0, budget.maxFiles);
    }

    return selected;
  }
}
