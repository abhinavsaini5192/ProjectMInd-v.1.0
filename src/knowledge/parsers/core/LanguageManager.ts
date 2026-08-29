import { ILanguageDetector } from '../interfaces/IParser';
import { KernelEventDispatcher } from '../../../kernel/core/KernelEventDispatcher';
import { ParserEventType } from '../types/ParserEvents';
import { ILogger } from '../../../workspace/interfaces/ILogger';

export class LanguageManager {
  private detectedLanguages: Set<string> = new Set();

  constructor(
    private detector: ILanguageDetector,
    private dispatcher: KernelEventDispatcher,
    private logger: ILogger
  ) {}

  public async detectWorkspaceLanguages(workspacePath: string, files: string[]): Promise<string[]> {
    const languages = await this.detector.detectLanguages(workspacePath, files);
    
    languages.forEach(lang => {
      this.detectedLanguages.add(lang);
      this.dispatcher.publish(ParserEventType.LanguageDetected, { language: lang, workspacePath });
      this.logger.info({ component: 'LanguageManager', operation: 'detect', message: `Detected Language: ${lang}`, severity: 'INFO' });
    });

    return Array.from(this.detectedLanguages);
  }

  public getActiveLanguages(): string[] {
    return Array.from(this.detectedLanguages);
  }
}
