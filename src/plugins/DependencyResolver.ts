import { PluginManifest } from './PluginManifest';

export class DependencyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DependencyError';
  }
}

/**
 * Resolves dependencies between plugins and provides a topologically sorted list for initialization.
 */
export class DependencyResolver {
  /**
   * Sorts the plugins topologically based on their dependencies.
   * If A depends on B, B will appear before A in the resulting array.
   *
   * @param manifests Array of plugin manifests to sort.
   * @throws {DependencyError} If a circular dependency or missing dependency is detected.
   */
  public static sort(manifests: PluginManifest[]): PluginManifest[] {
    const availablePlugins = new Map<string, PluginManifest>();
    for (const manifest of manifests) {
      if (availablePlugins.has(manifest.id)) {
        throw new DependencyError(`Duplicate plugin ID detected: ${manifest.id}`);
      }
      availablePlugins.set(manifest.id, manifest);
    }

    const sorted: PluginManifest[] = [];
    const visited = new Set<string>();
    const inProgress = new Set<string>();

    const visit = (manifest: PluginManifest) => {
      if (inProgress.has(manifest.id)) {
        throw new DependencyError(`Circular dependency detected involving plugin: ${manifest.id}`);
      }
      if (visited.has(manifest.id)) {
        return;
      }

      inProgress.add(manifest.id);

      // Check required dependencies
      if (manifest.dependencies) {
        for (const [depId, versionReq] of Object.entries(manifest.dependencies)) {
          const depManifest = availablePlugins.get(depId);
          if (!depManifest) {
            throw new DependencyError(`Plugin ${manifest.id} requires missing dependency: ${depId}`);
          }
          // Note: In a production system, we'd use a real semver check here.
          // For now, we assume if it's present, we satisfy it, or we could add basic version matching.
          
          visit(depManifest);
        }
      }

      // Check optional dependencies
      if (manifest.optionalDependencies) {
        for (const depId of Object.keys(manifest.optionalDependencies)) {
          const depManifest = availablePlugins.get(depId);
          if (depManifest) {
            visit(depManifest);
          }
        }
      }

      inProgress.delete(manifest.id);
      visited.add(manifest.id);
      sorted.push(manifest);
    };

    for (const manifest of manifests) {
      if (!visited.has(manifest.id)) {
        visit(manifest);
      }
    }

    return sorted;
  }
}
