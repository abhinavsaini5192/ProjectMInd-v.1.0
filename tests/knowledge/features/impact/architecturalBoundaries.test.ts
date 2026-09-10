import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Phase 6.7 - Architectural Boundaries', () => {
  const impactSrcDir = path.resolve(process.cwd(), 'src/knowledge/features/impact');

  function getAllFiles(dir: string, fileList: string[] = []): string[] {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        getAllFiles(filePath, fileList);
      } else if (file.endsWith('.ts')) {
        fileList.push(filePath);
      }
    }
    return fileList;
  }

  it('impact module must NOT directly import filesystem, child_process, or sqlite (Section 56)', () => {
    const allFiles = getAllFiles(impactSrcDir);
    expect(allFiles.length).toBeGreaterThan(15);

    const forbiddenImports = [
      'from \'fs\'',
      'from "fs"',
      'from \'node:fs\'',
      'from "node:fs"',
      'from \'child_process\'',
      'from "child_process"',
      'from \'node:child_process\'',
      'from "node:child_process"',
      'from \'better-sqlite3\'',
      'from "better-sqlite3"',
    ];

    for (const file of allFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      for (const forbidden of forbiddenImports) {
        expect(content.includes(forbidden), `Forbidden import "${forbidden}" found in ${file}`).toBe(false);
      }
    }
  });

  it('impact module must only perform read-only graph and model analysis', () => {
    const allFiles = getAllFiles(impactSrcDir);

    for (const file of allFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      expect(content).not.toMatch(/exec\s*\(/);
      expect(content).not.toMatch(/spawn\s*\(/);
    }
  });
});
