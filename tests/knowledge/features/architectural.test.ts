import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Feature Layer Architectural Boundaries', () => {
  it('should not import filesystem, sqlite, brain, or SLM in feature models and interfaces', () => {
    const featureCoreDir = path.resolve(__dirname, '../../../src/knowledge/features');
    const files = fs.readdirSync(featureCoreDir, { recursive: true }) as string[];

    for (const file of files) {
      if (typeof file === 'string' && file.endsWith('.ts')) {
        const fullPath = path.join(featureCoreDir, file);
        const content = fs.readFileSync(fullPath, 'utf8');

        expect(content).not.toContain("from 'better-sqlite3'");
        expect(content).not.toContain("from 'sqlite3'");
        expect(content).not.toContain("from '../../brain");
        expect(content).not.toContain("from '../../intelligence/slm");
      }
    }
  });
});
