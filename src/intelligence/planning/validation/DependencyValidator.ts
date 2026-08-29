import { ActionPlan } from '../models/ActionPlan';

export class DependencyValidator {
  public validate(plan: ActionPlan): { valid: boolean; issues: string[] } {
    const issues: string[] = [];
    const stepIds = new Set((plan.steps || []).map(s => s.stepId));

    // 1. Verify that all referenced dependencies exist
    for (const dep of plan.dependencies || []) {
      if (!stepIds.has(dep.stepId)) {
        issues.push(`Dependency refers to non-existent source step: "${dep.stepId}"`);
      }
      if (!stepIds.has(dep.dependsOnStepId)) {
        issues.push(`Dependency refers to non-existent target step: "${dep.dependsOnStepId}"`);
      }
      if (dep.stepId === dep.dependsOnStepId) {
        issues.push(`Step "${dep.stepId}" cannot depend on itself (self-cycle)`);
      }
    }

    // Also check step-level dependency lists
    for (const step of plan.steps || []) {
      for (const depId of step.dependencies || []) {
        if (!stepIds.has(depId)) {
          issues.push(`Step "${step.stepId}" depends on non-existent step "${depId}"`);
        }
        if (depId === step.stepId) {
          issues.push(`Step "${step.stepId}" cannot depend on itself`);
        }
      }
    }

    // 2. Cycle detection via topological sort (Kahn's algorithm)
    if (issues.length === 0 && plan.steps && plan.steps.length > 0) {
      const inDegree = new Map<string, number>();
      const adjList = new Map<string, string[]>();

      for (const step of plan.steps) {
        inDegree.set(step.stepId, 0);
        adjList.set(step.stepId, []);
      }

      // Populate graph from plan.dependencies and step.dependencies
      const allEdges: Array<{ from: string; to: string }> = [];
      for (const dep of plan.dependencies || []) {
        allEdges.push({ from: dep.dependsOnStepId, to: dep.stepId });
      }
      for (const step of plan.steps) {
        for (const depId of step.dependencies || []) {
          allEdges.push({ from: depId, to: step.stepId });
        }
      }

      for (const edge of allEdges) {
        if (adjList.has(edge.from) && adjList.has(edge.to)) {
          adjList.get(edge.from)!.push(edge.to);
          inDegree.set(edge.to, (inDegree.get(edge.to) || 0) + 1);
        }
      }

      const queue: string[] = [];
      for (const [id, deg] of inDegree.entries()) {
        if (deg === 0) queue.push(id);
      }

      let visitedCount = 0;
      while (queue.length > 0) {
        const current = queue.shift()!;
        visitedCount++;
        for (const neighbor of adjList.get(current) || []) {
          const newDeg = (inDegree.get(neighbor) || 1) - 1;
          inDegree.set(neighbor, newDeg);
          if (newDeg === 0) queue.push(neighbor);
        }
      }

      if (visitedCount < plan.steps.length) {
        issues.push('Circular dependency cycle detected in action plan steps');
      }
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }
}
