import { Risk } from '../models/Risk';

export class ImpactAnalyzer {
  constructor(private knowledgeGateway: any) {}

  public analyze(features: string[], repositoryId: string): { affectedFeatures: string[], affectedTests: string[] } {
    // Mock integration with L2 Impact API
    // If 'feat_auth' is modified, 'feat_profile' might be affected
    const affectedFeatures = new Set<string>();
    const affectedTests = new Set<string>();

    for (const f of features) {
       affectedFeatures.add(f); // Direct impact
       affectedTests.add(`${f}_tests`);
       if (f === 'feat_auth') {
         affectedFeatures.add('feat_profile');
         affectedFeatures.add('feat_dashboard');
       }
    }

    return {
      affectedFeatures: Array.from(affectedFeatures),
      affectedTests: Array.from(affectedTests)
    };
  }
}
