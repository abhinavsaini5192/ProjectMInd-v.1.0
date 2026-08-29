import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LanguageDetector } from '../../src/knowledge/parsers/core/LanguageDetector';
import { LanguageManager } from '../../src/knowledge/parsers/core/LanguageManager';
import { ParserRegistry } from '../../src/knowledge/parsers/core/ParserRegistry';
import { ParserFactory } from '../../src/knowledge/parsers/core/ParserFactory';
import { ParserManager } from '../../src/knowledge/parsers/core/ParserManager';
import { TypeScriptParser } from '../../src/knowledge/parsers/plugins/typescript/TypeScriptParser';
import { PythonParser } from '../../src/knowledge/parsers/plugins/python/PythonParser';
import { KernelEventDispatcher } from '../../src/kernel/core/KernelEventDispatcher';
import { StructuredLogger } from '../../src/workspace/logging/StructuredLogger';
import { ParserError, ParserEventType } from '../../src/knowledge/parsers/types/ParserEvents';

describe('Universal Language Framework', () => {
  let dispatcher: KernelEventDispatcher;
  let logger: StructuredLogger;
  let registry: ParserRegistry;
  let factory: ParserFactory;
  let detector: LanguageDetector;
  let langManager: LanguageManager;
  let parserManager: ParserManager;

  beforeEach(() => {
    dispatcher = new KernelEventDispatcher();
    logger = new StructuredLogger();
    vi.spyOn(logger, 'info').mockImplementation(() => {});
    vi.spyOn(logger, 'error').mockImplementation(() => {});

    detector = new LanguageDetector();
    langManager = new LanguageManager(detector, dispatcher, logger);
    
    registry = new ParserRegistry(dispatcher);
    factory = new ParserFactory(registry);
    parserManager = new ParserManager(factory, dispatcher, logger);
  });

  describe('Language Detection', () => {
    it('should correctly detect languages from manifests and extensions', async () => {
      const files = ['package.json', 'src/main.ts', 'backend/app.py', 'Cargo.toml'];
      const langs = await langManager.detectWorkspaceLanguages('/repo', files);
      
      expect(langs).toContain('javascript'); // package.json
      expect(langs).toContain('typescript'); // .ts
      expect(langs).toContain('python');     // .py
      expect(langs).toContain('rust');       // Cargo.toml
    });
  });

  describe('Parser Registry & Factory (Open/Closed Principle)', () => {
    it('should register and resolve plugins correctly', () => {
      const tsParser = new TypeScriptParser();
      registry.register(tsParser);
      
      const resolved = factory.create('typescript');
      expect(resolved.language).toBe('typescript');
      expect(resolved.getCapabilities().supportsClasses).toBe(true);
    });

    it('should throw ParserError for unregistered languages', () => {
      expect(() => factory.create('unknown_lang')).toThrowError(ParserError);
    });

    it('should prevent double registration', () => {
      registry.register(new TypeScriptParser());
      expect(() => registry.register(new TypeScriptParser())).toThrowError(ParserError);
    });
  });

  describe('Parser Manager & Tree-sitter Abstraction', () => {
    it('should parse files using the intermediate AST abstraction', async () => {
      registry.register(new PythonParser());
      
      const content = `def hello():\n  print("world")`;
      const result = await parserManager.parseFile('/repo/app.py', 'python', content);
      
      // Verification that the TreeSitterAdapter abstracted the AST properly
      expect(result.language).toBe('python');
      expect(result.ast.type).toBe('Program');
      expect(result.ast.rawText).toBe(content);
      expect(result.isCached).toBe(false);
    });

    it('should cache parsed results', async () => {
      registry.register(new TypeScriptParser());
      
      await parserManager.parseFile('/repo/auth.ts', 'typescript', 'class Auth {}');
      const result2 = await parserManager.parseFile('/repo/auth.ts', 'typescript', 'class Auth {}');
      
      expect(result2.isCached).toBe(true);
    });
  });

  describe('Event Bus Integration', () => {
    it('should emit ParsingCompleted and CacheHit events', async () => {
      registry.register(new TypeScriptParser());
      
      let completedFired = false;
      let cacheHitFired = false;

      dispatcher.subscribe(ParserEventType.ParsingCompleted, () => completedFired = true);
      dispatcher.subscribe(ParserEventType.ParserCacheHit, () => cacheHitFired = true);

      await parserManager.parseFile('/repo/test.ts', 'typescript', 'test');
      expect(completedFired).toBe(true);
      expect(cacheHitFired).toBe(false);

      await parserManager.parseFile('/repo/test.ts', 'typescript', 'test');
      expect(cacheHitFired).toBe(true);
    });
  });
});
