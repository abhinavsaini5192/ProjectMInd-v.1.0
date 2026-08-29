import { IntermediateASTNode } from '../../parsers/models/LanguageCapabilities';
import { UniversalNode } from '../models/UniversalNode';
import { ASTNormalizer } from './ASTNormalizer';
import { ASTValidator } from '../validation/ASTValidator';
import { ASTCache, ASTVersionManager } from './ASTVersionManager';

export class UniversalASTEngine {
  constructor(
    private normalizer: ASTNormalizer,
    private validator: ASTValidator,
    private cache: ASTCache,
    private versionManager: ASTVersionManager
  ) {}

  public process(intermediate: IntermediateASTNode, language: string, filePath: string, rawContent: string): UniversalNode {
    const hash = this.versionManager.generateContentHash(rawContent);

    if (!this.versionManager.hasFileChanged(filePath, hash)) {
      const cached = this.cache.get(filePath);
      if (cached) return cached;
    }

    const universalAst = this.normalizer.normalize(intermediate, language, filePath);
    this.validator.validate(universalAst);

    this.cache.set(filePath, universalAst);
    this.versionManager.updateVersion(filePath, hash);

    return universalAst;
  }
}
