import type { Feature } from '../../models/Feature';
import type { DependencyContext } from '../interfaces/IFeatureRelationshipSource';

export class DependencySourceHelper {
  private static readonly GENERIC_LIBRARIES = new Set([
    'lodash',
    'date-fns',
    'moment',
    'chalk',
    'winston',
    'debug',
    'axios',
    'express',
    'react',
    'react-dom',
    'tslib',
    'dotenv',
    'typescript',
    'vitest',
    'jest',
    'mocha',
    'chai',
    'prettier',
    'eslint',
  ]);

  /**
   * Check if a dependency target is a generic utility library
   */
  public static isGenericLibrary(name: string): boolean {
    if (!name) return false;
    const clean = name.toLowerCase().trim().replace(/^@types\//, '');
    return this.GENERIC_LIBRARIES.has(clean);
  }

  /**
   * Build a fast index from resourceId to Set of featureIds
   */
  public static buildResourceToFeaturesMap(
    allFeatures: Feature[],
    context: DependencyContext
  ): Map<string, Set<string>> {
    const map = new Map<string, Set<string>>();

    const add = (resourceId: string, featureId: string) => {
      if (!resourceId || !featureId) return;
      const lowerRes = resourceId.toLowerCase().trim();
      if (!map.has(lowerRes)) {
        map.set(lowerRes, new Set());
      }
      map.get(lowerRes)!.add(featureId);
    };

    // 1. From context.featureMappings
    if (context.featureMappings) {
      for (const m of context.featureMappings) {
        if (m.active !== false) {
          add(m.resourceId, m.featureId);
        }
      }
    }

    // 2. From feature.references
    for (const feat of allFeatures) {
      if (feat.references) {
        for (const ref of feat.references) {
          add(ref.resourceId, feat.id);
        }
      }
    }

    return map;
  }

  /**
   * Resolve which features a resource belongs to
   */
  public static getFeaturesForResource(
    resourceId: string,
    resourceMap: Map<string, Set<string>>
  ): string[] {
    if (!resourceId) return [];
    const lower = resourceId.toLowerCase().trim();
    const exact = resourceMap.get(lower);
    if (exact && exact.size > 0) {
      return Array.from(exact);
    }

    // Check substring match for file paths (e.g. src/auth/AuthService.ts matching AuthService)
    const matches = new Set<string>();
    for (const [key, featSet] of resourceMap.entries()) {
      if (lower.endsWith(key) || key.endsWith(lower) || lower.includes(key) || key.includes(lower)) {
        for (const fId of featSet) {
          matches.add(fId);
        }
      }
    }

    return Array.from(matches);
  }
}
