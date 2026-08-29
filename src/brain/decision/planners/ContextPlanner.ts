import { ContextItem } from '../models/ContextItem';

export class ContextPlanner {
  constructor(private knowledgeGateway: any) {}

  public plan(targetFeatures: string[], repositoryId: string): ContextItem[] {
    const items: ContextItem[] = [];
    
    // In reality, this queries the L2 Knowledge Gateway
    for (const feat of targetFeatures) {
       items.push({
         entityId: feat,
         type: 'feature',
         category: 'REQUIRED',
         relevanceScore: 1.0,
         confidence: 1.0,
         reason: 'Target feature for modification',
         source: 'FeatureResolver',
         estimatedTokenCost: 500
       });
       
       items.push({
         entityId: `${feat}_deps`,
         type: 'dependency',
         category: 'USEFUL',
         relevanceScore: 0.8,
         confidence: 0.9,
         reason: 'Direct dependency of target feature',
         source: 'DependencyKnowledgeAPI',
         estimatedTokenCost: 1000
       });
    }

    // Explicitly add an excluded item to test security filters
    items.push({
       entityId: 'sym_aws_secret',
       type: 'symbol',
       category: 'EXCLUDED',
       relevanceScore: 0.0,
       confidence: 1.0,
       reason: 'Security Policy: Sensitive Secret',
       source: 'SecurityManager',
       estimatedTokenCost: 50
    });

    return items;
  }
}
