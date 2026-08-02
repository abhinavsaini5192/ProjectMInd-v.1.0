import { z } from 'zod';

export enum ConfidenceLevel {
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low',
  UNKNOWN = 'Unknown'
}

/**
 * Standard semantic event schema representing repository-level meaning.
 */
export const SemanticEventSchema = z.object({
  /** Type of semantic event */
  type: z.enum(['FeatureAdded', 'BugFix', 'Refactor', 'Performance', 'Security', 'Documentation', 'DependencyUpdate', 'Unknown']),
  
  /** Short summary of the intent (e.g. "User Authentication added") */
  summary: z.string(),
  
  /** Optional secondary classifications */
  tags: z.array(z.string()).optional(),
  
  /** AI's confidence in this inference */
  confidence: z.nativeEnum(ConfidenceLevel),
  
  /** Explanatory reasoning tying it back to facts */
  reasoning: z.string()
});

export type SemanticEvent = z.infer<typeof SemanticEventSchema>;

/**
 * Standard architectural event schema.
 */
export const ArchitecturalEventSchema = z.object({
  type: z.enum(['NewSubsystem', 'LayerViolation', 'DependencyInversion', 'PublicAPIEvolution', 'ModuleCoupling']),
  description: z.string(),
  confidence: z.nativeEnum(ConfidenceLevel),
  affectedComponents: z.array(z.string()),
  reasoning: z.string()
});

export type ArchitecturalEvent = z.infer<typeof ArchitecturalEventSchema>;
