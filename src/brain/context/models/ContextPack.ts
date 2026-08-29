export enum ContextMode {
  MINIMAL = 'MINIMAL',
  STANDARD = 'STANDARD',
  DEEP = 'DEEP'
}

export interface ContextWarning {
  type: 'CONTRADICTION' | 'STALENESS' | 'SECURITY';
  message: string;
  severity: 'WARNING' | 'ERROR';
}

export interface ContextPack {
  packId: string;
  task: string;
  mode: ContextMode;
  sections: {
    required: any[];
    useful: any[];
    optional: any[];
  };
  excludedContext: string[]; // IDs of excluded items
  estimatedTokenCost: number;
  confidence: number;
  warnings: ContextWarning[];
  sources: string[];
}
