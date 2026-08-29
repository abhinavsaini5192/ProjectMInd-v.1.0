import { BaseKnowledgeAPI } from '../../core/BaseKnowledgeAPI';

export class FeatureKnowledgeAPI extends BaseKnowledgeAPI {
  constructor(queryEngine: any) {
    super(queryEngine, 'feature');
  }
}

export class SymbolKnowledgeAPI extends BaseKnowledgeAPI {
  constructor(queryEngine: any) {
    super(queryEngine, 'symbol');
  }
}

export class RepositoryKnowledgeAPI extends BaseKnowledgeAPI {
  constructor(queryEngine: any) {
    super(queryEngine, 'repository');
  }
}

export class ArchitectureKnowledgeAPI extends BaseKnowledgeAPI {
  constructor(queryEngine: any) {
    super(queryEngine, 'architecture');
  }
}

export class DependencyKnowledgeAPI extends BaseKnowledgeAPI {
  constructor(queryEngine: any) {
    super(queryEngine, 'dependency');
  }
}

export class EvolutionKnowledgeAPI extends BaseKnowledgeAPI {
  constructor(queryEngine: any) {
    super(queryEngine, 'evolution');
  }
}
