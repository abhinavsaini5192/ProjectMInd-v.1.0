import { describe, it, expect, vi } from 'vitest';
import { DiffEngine } from '../src/extraction/DiffEngine';
import { FileDiscoveryEngine } from '../src/extraction/FileDiscoveryEngine';
import { FactBuilder } from '../src/extraction/FactBuilder';

describe('DiffEngine', () => {
  it('should be instantiable', () => {
    const diff = new DiffEngine('/tmp/workspace');
    expect(diff).toBeDefined();
  });
});

describe('FileDiscoveryEngine', () => {
  it('should filter ignored paths', () => {
    const discovery = new FileDiscoveryEngine(['node_modules']);
    
    // Mock parser registration
    discovery.registerParser({
      language: 'typescript',
      extensions: ['.ts'],
      parse: vi.fn(),
      extractSymbols: vi.fn(),
      extractDependencies: vi.fn(),
      extractAPI: vi.fn()
    });

    const changes = [
      { status: 'added', path: 'src/main.ts' },
      { status: 'modified', path: 'node_modules/lib/index.ts' },
      { status: 'modified', path: 'src/style.css' }
    ] as any;

    const filtered = discovery.filterChanges(changes);
    
    expect(filtered.length).toBe(1);
    expect(filtered[0].path).toBe('src/main.ts');
  });
});

describe('FactBuilder', () => {
  it('should generate valid Fact objects', () => {
    const fact = FactBuilder.buildFact({
      id: FactBuilder.generateId('function', 'src/auth.ts', 'login'),
      type: 'FunctionAdded',
      language: 'typescript',
      sourceFile: 'src/auth.ts',
      timestamp: 123456789,
      version: 'abc1234',
      metadata: { foo: 'bar' }
    });
    
    expect(fact.id).toBe('function:src/auth.ts#login');
    expect(fact.confidence).toBe(1.0);
  });
});
