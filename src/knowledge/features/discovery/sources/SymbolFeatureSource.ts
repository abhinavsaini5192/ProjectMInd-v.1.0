import { randomUUID } from 'crypto';
import type { IFeatureDiscoverySource } from '../interfaces/IFeatureDiscoverySource';
import type { DiscoveryContext } from '../models/DiscoverySource';
import type { DiscoveryEvidence } from '../models/DiscoveryEvidence';
import { CapabilityNameInferer } from './CapabilityNameInferer';

export class SymbolFeatureSource implements IFeatureDiscoverySource {
  public readonly sourceType = 'SYMBOL';
  public readonly name = 'SymbolFeatureSource';

  private static readonly GENERIC_UTILITY_NAMES = new Set([
    'stringutils',
    'dateutils',
    'mathutils',
    'arrayutils',
    'objectutils',
    'logger',
    'consolelogger',
    'noop',
    'helper',
  ]);

  public discover(context: DiscoveryContext): DiscoveryEvidence[] {
    const evidenceList: DiscoveryEvidence[] = [];
    if (!context.symbols || context.symbols.length === 0) {
      return evidenceList;
    }

    for (const sym of context.symbols) {
      const lower = sym.name.toLowerCase();
      // Skip pure generic utilities from becoming standalone capability evidence
      if (
        SymbolFeatureSource.GENERIC_UTILITY_NAMES.has(lower) ||
        /(util|utils|helper|helpers|logger|logging|date|format|parse|math)/i.test(lower) ||
        (sym.filePath && /(?:utils|helpers|common)[\\/]/.test(sym.filePath))
      ) {
        continue;
      }

      const capability = CapabilityNameInferer.infer(sym.name);
      if (!capability) continue;

      evidenceList.push({
        evidenceId: `ev_sym_${randomUUID().slice(0, 8)}`,
        sourceType: 'SYMBOL',
        sourceId: sym.id || sym.name,
        evidenceType: 'IMPLEMENTATION_SYMBOL',
        description: `Exported symbol ${sym.name} (${sym.kind || 'class'}) in ${sym.filePath}`,
        targetCapability: capability,
        strength: 'STRONG',
        confidence: 0.85,
        resourceReference: {
          referenceId: `ref_sym_${randomUUID().slice(0, 8)}`,
          resourceType: 'SYMBOL',
          resourceId: sym.id || sym.name,
          role: 'IMPLEMENTATION',
          confidence: 0.85,
        },
        timestamp: Date.now(),
        metadata: {
          name: sym.name,
          kind: sym.kind,
          filePath: sym.filePath,
        },
      });
    }

    return evidenceList;
  }
}
