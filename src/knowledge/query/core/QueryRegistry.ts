import { IQuery, IQueryResult } from '../models/IQueryResult';

export interface IQueryHandler {
  execute(operation: string, filters: any): any;
}

export class QueryRegistry {
  private handlers: Map<string, IQueryHandler> = new Map();

  public registerHandler(entity: string, handler: IQueryHandler): void {
    this.handlers.set(entity.toLowerCase(), handler);
  }

  public getHandler(entity: string): IQueryHandler | undefined {
    return this.handlers.get(entity.toLowerCase());
  }
}
