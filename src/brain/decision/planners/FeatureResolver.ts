export class FeatureResolver {
  constructor(private knowledgeGateway: any) {}

  public resolve(subtasks: string[], repositoryId: string): string[] {
    // Deterministic keyword matching against Knowledge API (mocked for MVP flow)
    const features = new Set<string>();
    
    for (const task of subtasks) {
      const lower = task.toLowerCase();
      if (lower.includes('auth') || lower.includes('login') || lower.includes('jwt')) {
        features.add('feat_auth');
      }
      if (lower.includes('profile') || lower.includes('user')) {
        features.add('feat_profile');
      }
      if (lower.includes('dashboard')) {
        features.add('feat_dashboard');
      }
      if (lower.includes('payment') || lower.includes('stripe')) {
        features.add('feat_payment');
      }
    }

    return Array.from(features);
  }
}
