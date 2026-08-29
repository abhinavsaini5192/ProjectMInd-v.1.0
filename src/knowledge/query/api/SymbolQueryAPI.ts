import { IQueryHandler } from '../core/QueryRegistry';

export class SymbolQueryAPI implements IQueryHandler {
  public execute(operation: string, filters: any): any {
    if (operation === 'find') {
       return {
         data: { symbol: { id: 'sym_1', name: filters.name || 'Unknown' } },
         sources: ['sym_1']
       };
    }
    throw new Error(`Unsupported operation ${operation} on SymbolQueryAPI`);
  }
}
