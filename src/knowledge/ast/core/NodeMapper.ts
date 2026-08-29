import { NodeKind } from '../models/NodeKind';
import { LanguageMappingRules } from './LanguageMapper';

export class NodeMapper {
  /**
   * Translates a parser-specific node type into a standardized Universal NodeKind.
   */
  public mapKind(language: string, rawType: string): NodeKind {
    const rules = LanguageMappingRules[language];
    if (!rules) {
      // If language isn't explicitly mapped yet, fallback gracefully
      return NodeKind.Unknown;
    }

    const mapped = rules[rawType];
    if (mapped) {
      return mapped;
    }

    // Default heuristics if exact match isn't found
    const lowerType = rawType.toLowerCase();
    if (lowerType.includes('class')) return NodeKind.Class;
    if (lowerType.includes('func')) return NodeKind.Function;
    if (lowerType.includes('import')) return NodeKind.Import;
    if (lowerType.includes('comment')) return NodeKind.Comment;

    return NodeKind.Unknown;
  }
}
