import { ParserResult } from '../models/LanguageCapabilities';
import { IParserFactory } from '../interfaces/IParser';
import { KernelEventDispatcher } from '../../../kernel/core/KernelEventDispatcher';
import { ParserEventType } from '../types/ParserEvents';
import { ILogger } from '../../../workspace/interfaces/ILogger';

export class ParserManager {
  private cache: Map<string, ParserResult> = new Map();

  constructor(
    private factory: IParserFactory,
    private dispatcher: KernelEventDispatcher,
    private logger: ILogger
  ) {}

  public async parseFile(filePath: string, languageId: string, content: string): Promise<ParserResult> {
    this.dispatcher.publish(ParserEventType.ParsingStarted, { filePath, language: languageId });
    
    // Check Cache
    if (this.cache.has(filePath)) {
      this.dispatcher.publish(ParserEventType.ParserCacheHit, { filePath });
      const cached = this.cache.get(filePath)!;
      cached.isCached = true;
      return cached;
    }

    this.dispatcher.publish(ParserEventType.ParserCacheMiss, { filePath });
    
    const startTime = Date.now();
    try {
      const parser = this.factory.create(languageId);
      const result = await parser.parseFile(filePath, content);
      result.parseTimeMs = Date.now() - startTime;
      
      this.cache.set(filePath, result);
      
      this.dispatcher.publish(ParserEventType.ParsingCompleted, { filePath, time: result.parseTimeMs });
      return result;
    } catch (error: any) {
      this.dispatcher.publish(ParserEventType.ParsingFailed, { filePath, error: error.message });
      this.logger.error({ component: 'ParserManager', operation: 'parseFile', message: `Parse failed: ${filePath}`, severity: 'ERROR' });
      throw error;
    }
  }

  public clearCache(): void {
    this.cache.clear();
  }
}
