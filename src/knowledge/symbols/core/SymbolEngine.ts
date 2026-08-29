import { UniversalNode } from '../../ast/models/UniversalNode';
import { ASTTraverser } from '../../ast/visitors/ASTTraverser';
import { SymbolExtractor } from '../extraction/SymbolExtractor';
import { SymbolIndexer } from '../extraction/SymbolIndexer';
import { SymbolLifecycleManager } from './SymbolLifecycleManager';
import { SymbolValidator } from '../validation/SymbolValidator';
import { SymbolResolver } from '../extraction/SymbolResolver';
import { KernelEventDispatcher } from '../../../kernel/core/KernelEventDispatcher';

export class SymbolEngine {
  constructor(
    private traverser: ASTTraverser,
    private extractor: SymbolExtractor,
    private indexer: SymbolIndexer,
    private resolver: SymbolResolver,
    private lifecycle: SymbolLifecycleManager,
    private validator: SymbolValidator,
    private dispatcher: KernelEventDispatcher
  ) {}

  public processAST(universalAst: UniversalNode): void {
    // 1. Traverse and extract candidate symbols
    this.extractor.extractedSymbols = []; // Reset state per file processing
    this.traverser.traverse(universalAst, [this.extractor]);
    const candidates = this.extractor.extractedSymbols;

    // 2. Validate structural integrity of candidates
    this.validator.validate(candidates);

    // 3. Process lifecycle (Creation vs Update vs Unmodified)
    for (const candidate of candidates) {
      const existing = this.resolver.resolveById(candidate.id);
      const evolvedSymbol = this.lifecycle.processEvolution(existing, candidate);
      
      // 4. Index the result
      this.indexer.index(evolvedSymbol);
    }
  }

  public getResolver(): SymbolResolver {
    return this.resolver;
  }
}
