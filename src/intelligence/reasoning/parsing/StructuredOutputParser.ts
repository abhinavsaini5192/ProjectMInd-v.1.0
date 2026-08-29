import { JsonReasoningParser } from './JsonReasoningParser';
import { InvalidReasoningOutputError } from '../errors/InvalidReasoningOutputError';

export class StructuredOutputParser {
  private jsonParser = new JsonReasoningParser();

  public parse(rawResponse: string | object): any {
    if (typeof rawResponse === 'object' && rawResponse !== null) {
      return rawResponse;
    }

    if (typeof rawResponse === 'string') {
      return this.jsonParser.extractJson(rawResponse);
    }

    throw new InvalidReasoningOutputError('Unsupported raw response format for structured parsing');
  }
}
