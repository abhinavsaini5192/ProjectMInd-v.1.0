import { Fact, FactSchema } from './models/Fact';
import * as crypto from 'crypto';
import { ProjectMindError } from '../errors';

/**
 * Standardizes the generation of deterministic Fact structures.
 */
export class FactBuilder {
  /**
   * Generates a deterministic ID for a node.
   */
  public static generateId(type: string, filePath: string, localName: string): string {
    return `${type}:${filePath}#${localName}`;
  }

  /**
   * Builds and strictly validates a Fact object.
   */
  public static buildFact(params: Omit<Fact, 'confidence'>): Fact {
    const fact: Fact = {
      ...params,
      confidence: 1.0
    };

    const result = FactSchema.safeParse(fact);
    if (!result.success) {
      throw new ProjectMindError(`Fact schema violation: ${result.error.message}`, 'FACT_BUILD_FAILED');
    }

    return result.data;
  }
}
