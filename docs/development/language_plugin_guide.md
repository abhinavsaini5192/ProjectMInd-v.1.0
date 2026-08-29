# Language Plugin Guide

To add a new language to ProjectMind, you must build an `IParser` plugin.

## 1. Implement `IParser`
Create a new class in `src/knowledge/parsers/plugins/<language>/`.

```typescript
export class MyNewLanguageParser implements IParser {
  public readonly language = 'mylang';
  
  public detect(filePath: string): boolean {
    return filePath.endsWith('.mylang');
  }

  public async parseFile(filePath: string, content: string): Promise<ParserResult> {
    // Return an IntermediateASTNode
  }

  public getCapabilities(): LanguageCapabilities {
    return {
      supportsFunctions: true,
      // ...
    };
  }
}
```

## 2. Register Plugin
Register it during Kernel boot into the `ParserRegistry`:
```typescript
registry.register(new MyNewLanguageParser());
```

## 3. Strict Rules
- **No external dependencies**: Only use the `TreeSitterAdapter`.
- **No AI**: Plugins strictly generate ASTs, nothing else.
