export interface LayerResolutionStrategy {
  name: string;
  resolve(symbolId: string): string | undefined; // Returns layer name or undefined
}
