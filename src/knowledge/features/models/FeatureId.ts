export type FeatureId = string;

export function isValidFeatureId(id: string): boolean {
  return typeof id === 'string' && /^feat_[a-zA-Z0-9_-]{8,}$/.test(id);
}
