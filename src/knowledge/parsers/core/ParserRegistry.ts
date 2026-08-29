import { IParserRegistry, IParser } from '../interfaces/IParser';
import { ParserError, ParserEventType } from '../types/ParserEvents';
import { KernelEventDispatcher } from '../../../kernel/core/KernelEventDispatcher';

export class ParserRegistry implements IParserRegistry {
  private parsers: Map<string, IParser> = new Map();

  constructor(private dispatcher: KernelEventDispatcher) {}

  public register(parser: IParser): void {
    if (this.parsers.has(parser.language)) {
      throw new ParserError('REG_ERR', `Parser for language ${parser.language} is already registered.`);
    }
    
    this.parsers.set(parser.language, parser);
    this.dispatcher.publish(ParserEventType.ParserRegistered, { language: parser.language });
  }

  public remove(languageId: string): void {
    const parser = this.parsers.get(languageId);
    if (parser) {
      parser.dispose();
      this.parsers.delete(languageId);
      this.dispatcher.publish(ParserEventType.ParserRemoved, { language: languageId });
    }
  }

  public resolve(languageId: string): IParser | undefined {
    return this.parsers.get(languageId);
  }

  public enumerate(): string[] {
    return Array.from(this.parsers.keys());
  }
}
