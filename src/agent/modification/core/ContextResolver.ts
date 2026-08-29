import { ModificationIntent } from '../models/ModificationIntent';

export class ContextResolver {
  public resolveTarget(intent: ModificationIntent): { absolutePath: string, symbolRange?: { startLine: number, endLine: number } } {
    // In a real system, this queries the Layer 2 SymbolRegistry.
    // For this mock implementation, we return mock values if a symbol is provided.
    
    // Check if ambiguous (e.g. symbol provided but it's a very generic name like 'init')
    if (intent.symbol === 'init') {
       throw new Error(`Ambiguous symbol target: ${intent.symbol}`);
    }

    const mockPath = intent.file.startsWith('/') ? intent.file : `/mock/repo/${intent.file}`;

    if (intent.symbol) {
      return {
        absolutePath: mockPath,
        symbolRange: { startLine: 10, endLine: 20 }
      };
    }

    return {
      absolutePath: mockPath
    };
  }
}
