import type { Feature } from '../../models/Feature';
import { CapabilityNameInferer } from '../../discovery/sources/CapabilityNameInferer';

export class MappingMatcher {
  private static readonly GENERIC_UTILITIES = new Set([
    'date',
    'dateutils',
    'string',
    'stringutils',
    'math',
    'mathutils',
    'logger',
    'logging',
    'consolelogger',
    'helper',
    'helpers',
    'utils',
    'util',
    'common',
    'misc',
    'noop',
  ]);

  /**
   * Check if a resource name or path is a pure generic utility
   */
  public static isGenericUtility(identifier: string, filePath?: string): boolean {
    const clean = identifier.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (this.GENERIC_UTILITIES.has(clean)) return true;

    if (filePath) {
      const normalizedPath = filePath.toLowerCase().replace(/\\/g, '/');
      const fileName = normalizedPath.split('/').pop()?.replace(/\.[^/.]+$/, '') || '';
      const cleanFileName = fileName.replace(/[^a-z0-9]/g, '');

      if (this.GENERIC_UTILITIES.has(cleanFileName)) return true;
      for (const gen of this.GENERIC_UTILITIES) {
        if (cleanFileName.includes(gen)) return true;
      }

      if (
        normalizedPath.includes('/utils/') ||
        normalizedPath.includes('/common/') ||
        normalizedPath.includes('/helpers/')
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Determine whether a candidate string/identifier relates to the given feature
   */
  public static matchesFeature(feature: Feature, candidateText: string): { matches: boolean; confidence: number; reason: string } {
    if (!candidateText || !feature) {
      return { matches: false, confidence: 0, reason: 'Empty identifier or feature' };
    }

    const featureName = feature.name.toLowerCase().trim();
    const cleanCandidate = candidateText.trim();
    const candidateLower = cleanCandidate.toLowerCase();

    // 1. Direct match with existing feature references
    if (feature.references && feature.references.length > 0) {
      const existingRef = feature.references.find(
        (r) => r.resourceId.toLowerCase() === candidateLower || candidateLower.includes(r.resourceId.toLowerCase())
      );
      if (existingRef) {
        return {
          matches: true,
          confidence: Math.max(0.9, existingRef.confidence || 0.9),
          reason: `Resource directly matches known reference "${existingRef.resourceId}" with role ${existingRef.role}`,
        };
      }
    }

    // 2. Exact capability inference
    const inferred = CapabilityNameInferer.infer(cleanCandidate);
    if (inferred && inferred.toLowerCase() === featureName) {
      return {
        matches: true,
        confidence: 0.88,
        reason: `Inferred capability "${inferred}" exactly matches feature name "${feature.name}"`,
      };
    }

    // 3. Domain keyword mapping for technical identifiers/packages (e.g. jsonwebtoken, bcrypt, stripe)
    const lowerClean = candidateLower.replace(/[^a-z0-9]/g, '');
    if (featureName.includes('auth')) {
      if (
        lowerClean.includes('jwt') ||
        lowerClean.includes('jsonwebtoken') ||
        lowerClean.includes('bcrypt') ||
        lowerClean.includes('argon') ||
        lowerClean.includes('passport') ||
        lowerClean.includes('oauth') ||
        lowerClean.includes('session') ||
        lowerClean.includes('token') ||
        lowerClean.includes('credential') ||
        lowerClean.includes('login') ||
        lowerClean.includes('logout') ||
        lowerClean.includes('auth')
      ) {
        return {
          matches: true,
          confidence: 0.85,
          reason: `Technical identifier "${candidateText}" is strongly associated with Authentication`,
        };
      }
    }

    if (featureName.includes('billing') || featureName.includes('pay')) {
      if (
        lowerClean.includes('stripe') ||
        lowerClean.includes('paypal') ||
        lowerClean.includes('invoice') ||
        lowerClean.includes('billing') ||
        lowerClean.includes('charge') ||
        lowerClean.includes('checkout')
      ) {
        return {
          matches: true,
          confidence: 0.85,
          reason: `Technical identifier "${candidateText}" is strongly associated with Payment/Billing`,
        };
      }
    }

    // 4. Substring / Token overlap
    const featureTokens = featureName.split(/[\s:_\-/.]+/).filter((t) => t.length > 2);
    const candidateTokens = candidateLower.split(/[\s:_\-/.]+/).filter((t) => t.length > 2);
    const matchedTokens = featureTokens.filter((t) => candidateLower.includes(t) || candidateTokens.some((ct) => ct.startsWith(t) || t.startsWith(ct)));

    if (matchedTokens.length > 0 && matchedTokens.length === featureTokens.length) {
      return {
        matches: true,
        confidence: 0.82,
        reason: `Candidate contains all feature name tokens (${matchedTokens.join(', ')})`,
      };
    }

    if (matchedTokens.length > 0) {
      return {
        matches: true,
        confidence: 0.65,
        reason: `Candidate contains partial feature tokens (${matchedTokens.join(', ')})`,
      };
    }

    // 5. Inferred capability partial match
    if (inferred && (inferred.toLowerCase().includes(featureName) || featureName.includes(inferred.toLowerCase()))) {
      return {
        matches: true,
        confidence: 0.75,
        reason: `Inferred capability "${inferred}" overlaps with feature name "${feature.name}"`,
      };
    }

    return { matches: false, confidence: 0, reason: 'No semantic match' };
  }
}
