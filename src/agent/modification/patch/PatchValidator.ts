import { ILanguageAdapter } from '../ast/ILanguageAdapter';

export class PatchValidator {
  public validate(patchedContent: string, adapter?: ILanguageAdapter): boolean {
    // Structural checks
    if (!patchedContent) return false;

    // Check for obvious syntax errors like unmatched brackets if no AST is available
    const openBrackets = (patchedContent.match(/\{/g) || []).length;
    const closeBrackets = (patchedContent.match(/\}/g) || []).length;
    if (openBrackets !== closeBrackets) {
      throw new Error('Patch validation failed: Unmatched brackets detected.');
    }

    // If an AST adapter is provided, use it for rigorous syntax verification
    if (adapter) {
      if (!adapter.verifySyntax(patchedContent)) {
        throw new Error('Patch validation failed: Syntax error detected by language adapter.');
      }
    }

    return true;
  }
}
