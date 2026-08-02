import { describe, it, expect } from 'vitest';
import { ContextEngineService } from '../src/context/ContextEngineService';
import { KnowledgeGraph } from '../src/intelligence/engines/KnowledgeGraphBuilder';
import { Fact } from '../src/extraction/models/Fact';
import { ClaudeAdapter, GenericMarkdownAdapter } from '../src/context/adapters/AgentAdapters';

describe('ContextEngineService', () => {
  it('should generate optimized generic markdown context correctly', () => {
    const engine = new ContextEngineService();

    const mockGraph: KnowledgeGraph = {
      facts: new Map<string, Fact>([
        ['function:src/auth.ts#login', {
          id: 'function:src/auth.ts#login',
          type: 'FunctionAdded',
          language: 'typescript',
          sourceFile: 'src/auth.ts',
          timestamp: 123,
          version: 'abc',
          confidence: 1.0
        }]
      ]),
      semanticEvents: [
        { type: 'FeatureAdded', summary: 'Added Auth', confidence: 'High' as any, reasoning: '' }
      ],
      architecturalEvents: []
    };

    const markdownContext = engine.generateContext('Fix bug in auth', 'login', mockGraph, new GenericMarkdownAdapter());
    
    expect(markdownContext).toContain('Task Intent:** Bug Fix');
    expect(markdownContext).toContain('Added Auth');
    expect(markdownContext).toContain('src/auth.ts');
    expect(markdownContext).toContain('function:src/auth.ts#login');
  });

  it('should generate optimized XML context for Claude correctly', () => {
    const engine = new ContextEngineService();

    const mockGraph: KnowledgeGraph = {
      facts: new Map<string, Fact>([
        ['function:src/auth.ts#login', {
          id: 'function:src/auth.ts#login',
          type: 'FunctionAdded',
          language: 'typescript',
          sourceFile: 'src/auth.ts',
          timestamp: 123,
          version: 'abc',
          confidence: 1.0
        }]
      ]),
      semanticEvents: [],
      architecturalEvents: []
    };

    const claudeContext = engine.generateContext('Add new auth feature', 'login', mockGraph, new ClaudeAdapter());
    
    expect(claudeContext).toContain('<task_intent>Feature Development</task_intent>');
    expect(claudeContext).toContain('<file path="src/auth.ts"');
    expect(claudeContext).toContain('<symbol id="function:src/auth.ts#login" />');
  });
});
