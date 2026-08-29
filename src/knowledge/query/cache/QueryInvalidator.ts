import { KernelEventDispatcher } from '../../../kernel/core/KernelEventDispatcher';
import { QueryCache } from './QueryCache';
import { QUERY_CACHE_INVALIDATED } from '../types/QueryEvents';

export class QueryInvalidator {
  constructor(private cache: QueryCache, private dispatcher: KernelEventDispatcher) {}

  public listen(): void {
    // When the underlying knowledge layer updates, invalidate cache selectively
    this.dispatcher.subscribe('Feature:Updated', () => {
      this.cache.invalidateEntity('feature');
      this.dispatcher.publish(QUERY_CACHE_INVALIDATED, { entity: 'feature' });
    });

    this.dispatcher.subscribe('Evolution:Updated', () => {
      this.cache.invalidateEntity('evolution');
      this.dispatcher.publish(QUERY_CACHE_INVALIDATED, { entity: 'evolution' });
    });

    this.dispatcher.subscribe('Dependency:Created', () => {
       this.cache.invalidateEntity('dependency');
       this.cache.invalidateEntity('architecture');
    });
  }
}
