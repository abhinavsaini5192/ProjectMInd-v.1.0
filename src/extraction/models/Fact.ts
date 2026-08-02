import { z } from 'zod';

/**
 * Zod schema for structural facts to ensure strict determinism and standardized formats.
 */
export const FactSchema = z.object({
  /** Globally unique ID. e.g., 'function:src/main.ts#login' */
  id: z.string(),
  
  /** The type of fact. */
  type: z.enum([
    'ClassAdded', 'ClassRemoved', 'ClassModified',
    'FunctionAdded', 'FunctionRemoved', 'FunctionModified',
    'InterfaceAdded', 'InterfaceRemoved',
    'DependencyAdded', 'DependencyRemoved',
    'FileAdded', 'FileRemoved'
  ]),
  
  /** The programming language the fact was extracted from. */
  language: z.string(),
  
  /** The file where the fact originated. */
  sourceFile: z.string(),
  
  /** UNIX timestamp of extraction. */
  timestamp: z.number(),
  
  /** Associated commit hash or version. */
  version: z.string(),
  
  /** Semantic metadata (e.g. function signature, visibility). */
  metadata: z.record(z.string(), z.any()).optional(),
  
  /** Relationships (e.g. { type: 'calls', targetId: '...' }). */
  relationships: z.array(z.object({
    type: z.enum(['calls', 'imports', 'implements', 'inherits', 'contains']),
    targetId: z.string()
  })).optional(),
  
  /** Confidence is always 1.0 for the deterministic extraction engine. */
  confidence: z.literal(1.0)
});

export type Fact = z.infer<typeof FactSchema>;

/**
 * Schema for the extracted graph diff that will be passed to the Persistence Layer.
 */
export const StructuralGraphDiffSchema = z.object({
  nodes_added: z.array(FactSchema),
  nodes_removed: z.array(z.string()), // Array of Node IDs
  edges_added: z.array(z.object({
    source: z.string(),
    target: z.string(),
    type: z.enum(['calls', 'imports', 'implements', 'inherits', 'contains'])
  })),
  edges_removed: z.array(z.object({
    source: z.string(),
    target: z.string(),
    type: z.enum(['calls', 'imports', 'implements', 'inherits', 'contains'])
  }))
});

export type StructuralGraphDiff = z.infer<typeof StructuralGraphDiffSchema>;
