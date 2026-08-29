import { IParserFactory, IParserRegistry, IParser } from '../interfaces/IParser';
import { ParserError } from '../types/ParserEvents';

export class ParserFactory implements IParserFactory {
  constructor(private registry: IParserRegistry) {}

  public create(languageId: string): IParser {
    const parser = this.registry.resolve(languageId);
    if (!parser) {
      throw new ParserError('FACTORY_ERR', `No parser registered for language: ${languageId}`);
    }
    return parser;
  }
}
