import { ContextPack, ContextWarning } from '../../context/models/ContextPack';

export class ContradictionReasoner {
  public analyze(warnings: ContextWarning[]): { realContradictions: ContextWarning[], exceptions: ContextWarning[] } {
    const realContradictions: ContextWarning[] = [];
    const exceptions: ContextWarning[] = [];

    for (const w of warnings) {
       // Mock logic: Architecture rules can be overridden if explicitly permitted
       if (w.message.includes('mock_exception')) {
          exceptions.push(w);
       } else {
          realContradictions.push(w);
       }
    }

    return { realContradictions, exceptions };
  }
}
