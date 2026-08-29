import { ContextPlan, TaskProfile } from '../models/ContextPlan';
import { ContextRequirement } from '../models/ContextRequirement';
import { ContextType } from '../models/ContextType';
import { ContextSourceType } from '../models/ContextSource';

export class ContextPlanner {
  public plan(taskIntent: string, modelContextWindow: number = 8192, explicitProfile?: TaskProfile): ContextPlan {
    const taskType = explicitProfile || this.detectTaskProfile(taskIntent);
    const explicitReferences = this.extractExplicitReferences(taskIntent);
    const requirements = this.getRequirementsForProfile(taskType, explicitReferences);

    return {
      planId: `cplan_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      taskType,
      taskIntent,
      explicitReferences,
      requirements,
      exclusions: ['node_modules', '.git', '.env'],
      tokenBudget: Math.floor(modelContextWindow * 0.75), // 75% for context, 25% reserved for prompt/output
      createdAt: Date.now()
    };
  }

  private detectTaskProfile(intent: string): TaskProfile {
    const lower = intent.toLowerCase();
    if (lower.includes('fix') || lower.includes('bug') || lower.includes('error') || lower.includes('timeout') || lower.includes('crash')) {
      return TaskProfile.BUG_FIX;
    }
    if (lower.includes('review') || lower.includes('audit')) {
      return TaskProfile.CODE_REVIEW;
    }
    if (lower.includes('refactor') || lower.includes('clean') || lower.includes('restructure')) {
      return TaskProfile.REFACTORING;
    }
    if (lower.includes('arch') || lower.includes('design') || lower.includes('layer')) {
      return TaskProfile.ARCHITECTURE_ANALYSIS;
    }
    if (lower.includes('create') || lower.includes('add') || lower.includes('implement') || lower.includes('build')) {
      return TaskProfile.CODE_GENERATION;
    }
    if (lower.includes('explain') || lower.includes('how') || lower.includes('why')) {
      return TaskProfile.EXPLANATION;
    }
    return TaskProfile.GENERAL;
  }

  private extractExplicitReferences(intent: string): string[] {
    const references: string[] = [];
    
    // Extract file paths like foo/bar.ts or symbols
    const fileMatches = intent.match(/[a-zA-Z0-9_\-\.\/]+\.(ts|js|json|md|py)/g);
    if (fileMatches) {
      references.push(...fileMatches);
    }

    // Extract PascalCase symbol names (e.g. AuthService, SessionManager)
    const symbolMatches = intent.match(/\b[A-Z][a-zA-Z0-9]+(?:Service|Manager|Engine|Store|Provider|Controller|Handler|Client|Factory|Builder)\b/g);
    if (symbolMatches) {
      references.push(...symbolMatches);
    }

    // If no specific symbol matched, extract key domain terms
    if (references.length === 0) {
      const words = intent.split(/\s+/).filter(w => w.length > 3 && !['what', 'with', 'from', 'this', 'that'].includes(w.toLowerCase()));
      if (words.length > 0) {
        references.push(words[0]);
      }
    }

    return Array.from(new Set(references));
  }

  private getRequirementsForProfile(profile: TaskProfile, explicitRefs: string[]): ContextRequirement[] {
    const requirements: ContextRequirement[] = [];

    switch (profile) {
      case TaskProfile.BUG_FIX:
        requirements.push(
          { type: ContextType.SYMBOL, sourceType: ContextSourceType.KNOWLEDGE_GRAPH, required: true, priority: 1, entities: explicitRefs },
          { type: ContextType.DEPENDENCY, sourceType: ContextSourceType.DEPENDENCY_ENGINE, required: true, priority: 1, entities: explicitRefs },
          { type: ContextType.FEATURE, sourceType: ContextSourceType.FEATURE_ENGINE, required: false, priority: 2 },
          { type: ContextType.MEMORY, sourceType: ContextSourceType.MEMORY, required: false, priority: 2 },
          { type: ContextType.RECENT_CHANGE, sourceType: ContextSourceType.CHANGE_HISTORY, required: false, priority: 3 },
          { type: ContextType.ARCHITECTURE, sourceType: ContextSourceType.ARCHITECTURE_ENGINE, required: false, priority: 4 }
        );
        break;

      case TaskProfile.CODE_REVIEW:
        requirements.push(
          { type: ContextType.RECENT_CHANGE, sourceType: ContextSourceType.CHANGE_HISTORY, required: true, priority: 1 },
          { type: ContextType.DEPENDENCY, sourceType: ContextSourceType.DEPENDENCY_ENGINE, required: true, priority: 2 },
          { type: ContextType.ARCHITECTURE, sourceType: ContextSourceType.ARCHITECTURE_ENGINE, required: true, priority: 2 },
          { type: ContextType.MEMORY, sourceType: ContextSourceType.MEMORY, required: false, priority: 3 }
        );
        break;

      case TaskProfile.ARCHITECTURE_ANALYSIS:
        requirements.push(
          { type: ContextType.ARCHITECTURE, sourceType: ContextSourceType.ARCHITECTURE_ENGINE, required: true, priority: 1 },
          { type: ContextType.PROJECT_OVERVIEW, sourceType: ContextSourceType.KNOWLEDGE_GRAPH, required: true, priority: 1 },
          { type: ContextType.DEPENDENCY, sourceType: ContextSourceType.DEPENDENCY_ENGINE, required: true, priority: 2 },
          { type: ContextType.FEATURE, sourceType: ContextSourceType.FEATURE_ENGINE, required: false, priority: 3 }
        );
        break;

      default:
        requirements.push(
          { type: ContextType.SYMBOL, sourceType: ContextSourceType.KNOWLEDGE_GRAPH, required: true, priority: 1, entities: explicitRefs },
          { type: ContextType.DEPENDENCY, sourceType: ContextSourceType.DEPENDENCY_ENGINE, required: false, priority: 2 },
          { type: ContextType.MEMORY, sourceType: ContextSourceType.MEMORY, required: false, priority: 3 },
          { type: ContextType.PROJECT_OVERVIEW, sourceType: ContextSourceType.KNOWLEDGE_GRAPH, required: false, priority: 4 }
        );
        break;
    }

    return requirements;
  }
}
