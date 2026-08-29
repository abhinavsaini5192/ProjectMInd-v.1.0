export enum ParserEventType {
  LanguageDetected = 'Parser:LanguageDetected',
  ParserLoaded = 'Parser:ParserLoaded',
  ParserInitialized = 'Parser:ParserInitialized',
  ParsingStarted = 'Parser:ParsingStarted',
  ParsingCompleted = 'Parser:ParsingCompleted',
  ParsingFailed = 'Parser:ParsingFailed',
  ParserDisposed = 'Parser:ParserDisposed',
  ParserRegistered = 'Parser:ParserRegistered',
  ParserRemoved = 'Parser:ParserRemoved',
  ParserCacheHit = 'Parser:ParserCacheHit',
  ParserCacheMiss = 'Parser:ParserCacheMiss'
}

export class ParserError extends Error {
  constructor(public code: string, message: string, public details?: any) {
    super(message);
    this.name = 'ParserError';
  }
}
