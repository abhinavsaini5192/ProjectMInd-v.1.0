import { TaskComplexity } from '../models/Subtask';

export class ComplexityGuard {
  public estimateComplexity(goalText: string, affectedModulesCount: number, dependencyDepth: number): TaskComplexity {
    const text = goalText.toLowerCase();

    if (text.startsWith('rename') || text.startsWith('fix typo') || (affectedModulesCount <= 1 && dependencyDepth <= 1)) {
      return 'TRIVIAL';
    }

    if (affectedModulesCount <= 2 && dependencyDepth <= 2) {
      return 'LOW';
    }

    if (affectedModulesCount <= 5 && dependencyDepth <= 4) {
      return 'MEDIUM';
    }

    if (affectedModulesCount <= 10 || text.includes('refactor') || text.includes('redesign')) {
      return 'HIGH';
    }

    return 'VERY_HIGH';
  }
}
