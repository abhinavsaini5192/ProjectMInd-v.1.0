import { z } from 'zod';

/**
 * Contract for all runtime events emitted by ProjectMind.
 * Every emitted runtime event MUST conform to this wrapper format when saved to the EventJournal.
 */
export const ResearchEventSchemaV1 = z.object({
  eventId: z.string(),
  timestamp: z.number(),
  repositoryId: z.string(),
  commitHash: z.string(),
  runtimeEventName: z.string(),
  schemaVersion: z.literal('repository_event.v1'),
  payload: z.any()
});

export type ResearchEvent = z.infer<typeof ResearchEventSchemaV1>;

/**
 * Standardized Machine Learning Training Sample.
 * Guaranteed to have a stable sampleId and lineage tracking for full reproducibility.
 */
export const TrainingSampleSchemaV1 = z.object({
  sampleId: z.string(),
  repositoryId: z.string(),
  commitHash: z.string(),
  timestamp: z.number(),
  schemaVersion: z.literal('training_sample.v1'),
  lineage: z.object({
    generatorVersion: z.string(),
    eventHashes: z.array(z.string())
  }),
  input: z.object({
    changedFiles: z.array(z.string()),
    gitDiff: z.string().optional(),
    architectureState: z.any().optional(),
    knowledgeGraphSnippet: z.any().optional(),
    repositoryStats: z.any().optional()
  }),
  output: z.object({
    semanticLabels: z.array(z.string()),
    architectureChanges: z.array(z.string()).optional(),
    confidenceScore: z.number(),
    reasoningTrace: z.string().optional() // Retained semantic reasoning
  }),
  metadata: z.object({
    qualityScore: z.number(),
    languageDistribution: z.record(z.string(), z.number()).optional()
  })
});

export type TrainingSample = z.infer<typeof TrainingSampleSchemaV1>;

export const DatasetManifestSchema = z.object({
  datasetVersion: z.string(),
  generatorVersion: z.string(),
  schemaVersion: z.string(),
  creationTimestamp: z.number(),
  repositoryCount: z.number(),
  sampleCount: z.number(),
  languageDistribution: z.record(z.string(), z.number()),
  qualityMetrics: z.object({
    averageConfidence: z.number(),
    averageDiffSize: z.number()
  })
});

export type DatasetManifest = z.infer<typeof DatasetManifestSchema>;
