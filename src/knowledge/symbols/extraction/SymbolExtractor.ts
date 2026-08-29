import { IASTVisitor } from '../../ast/visitors/ASTTraverser';
import { UniversalNode } from '../../ast/models/UniversalNode';
import { NodeKind } from '../../ast/models/NodeKind';
import { SymbolKind } from '../models/SymbolKind';
import { SymbolFactory } from '../core/SymbolFactory';
import { Symbol } from '../models/Symbol';

export class SymbolExtractor implements IASTVisitor {
  public extractedSymbols: Symbol[] = [];

  constructor(
    private factory: SymbolFactory,
    private repository: string,
    private workspace: string
  ) {}

  public visit(node: UniversalNode): void {
    const kind = this.mapKind(node.kind);
    if (kind === SymbolKind.Unknown || !node.name) return; // Only track named semantic symbols

    // Calculate Scope based on parent. For now, we mock scope logic with parentID 
    // since deep traversal namespace building is complex without full AST context.
    const scope = node.parentId ? `scope::${node.parentId}` : 'global';

    const symbol = this.factory.create(
      kind,
      node.name,
      node.language,
      this.repository,
      this.workspace,
      scope,
      'public', // Visibility detection heuristic goes here
      node.location,
      node.rawText || '',
      '', // Doc extraction heuristic
      node.parentId
    );

    this.extractedSymbols.push(symbol);
  }

  private mapKind(nodeKind: NodeKind): SymbolKind {
    switch(nodeKind) {
      case NodeKind.Class: return SymbolKind.Class;
      case NodeKind.Interface: return SymbolKind.Interface;
      case NodeKind.Function: return SymbolKind.Function;
      case NodeKind.Method: return SymbolKind.Method;
      case NodeKind.Variable: return SymbolKind.Variable;
      case NodeKind.Constant: return SymbolKind.Constant;
      case NodeKind.Module: return SymbolKind.Module;
      default: return SymbolKind.Unknown;
    }
  }
}
