import { Relationship } from '../models/Relationship';
import { RelationshipType } from '../models/RelationshipType';
import { RelationshipEvidence } from '../models/RelationshipEvidence';
import { RelationshipFactory } from './RelationshipFactory';

export class RelationshipBuilder {
  private sourceId!: string;
  private targetId!: string;
  private type!: RelationshipType;
  private direction: 'directed' | 'bidirectional' = 'directed';
  private confidence: number = 1.0;
  private weight: number = 1.0;
  private evidence: RelationshipEvidence[] = [];
  private metadata: Record<string, any> = {};

  constructor(private factory: RelationshipFactory) {}

  public from(sourceId: string): this {
    this.sourceId = sourceId;
    return this;
  }

  public to(targetId: string): this {
    this.targetId = targetId;
    return this;
  }

  public withType(type: RelationshipType): this {
    this.type = type;
    return this;
  }

  public bidirectional(): this {
    this.direction = 'bidirectional';
    return this;
  }

  public addEvidence(evidence: RelationshipEvidence): this {
    this.evidence.push(evidence);
    return this;
  }

  public withConfidence(confidence: number): this {
    this.confidence = confidence;
    return this;
  }

  public build(): Relationship {
    if (!this.sourceId || !this.targetId || !this.type) {
      throw new Error('Cannot build relationship: Source, Target, and Type are required.');
    }

    return this.factory.create(
      this.sourceId,
      this.targetId,
      this.type,
      this.direction,
      this.evidence,
      this.confidence,
      this.weight,
      this.metadata
    );
  }
}
