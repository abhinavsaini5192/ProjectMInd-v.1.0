import { ILanguageDetector } from '../interfaces/IParser';

export class LanguageDetector implements ILanguageDetector {
  private readonly manifestMapping: Record<string, string> = {
    'package.json': 'javascript',
    'tsconfig.json': 'typescript',
    'requirements.txt': 'python',
    'Cargo.toml': 'rust',
    'go.mod': 'go',
    'pom.xml': 'java',
    'build.gradle': 'java',
    'pubspec.yaml': 'dart',
    'composer.json': 'php',
    'CMakeLists.txt': 'cpp'
  };

  private readonly extensionMapping: Record<string, string> = {
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.py': 'python',
    '.java': 'java',
    '.go': 'go',
    '.rs': 'rust',
    '.cpp': 'cpp',
    '.cc': 'cpp',
    '.cxx': 'cpp',
    '.hpp': 'cpp',
    '.cs': 'csharp',
    '.dart': 'dart'
  };

  public async detectLanguages(workspacePath: string, files: string[]): Promise<string[]> {
    const detected = new Set<string>();

    for (const file of files) {
      // Check manifest files first (usually at root level, but we check filename match)
      const fileName = file.split('/').pop() || file;
      if (this.manifestMapping[fileName]) {
        detected.add(this.manifestMapping[fileName]);
      }

      // Check extensions
      const extMatch = file.match(/\.[0-9a-z]+$/i);
      if (extMatch && this.extensionMapping[extMatch[0]]) {
        detected.add(this.extensionMapping[extMatch[0]]);
      }
    }

    return Array.from(detected);
  }
}
