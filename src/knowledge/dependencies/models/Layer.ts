export interface Layer {
  id: string;
  name: string; // Presentation, Application, Domain, Infrastructure, etc.
  description: string;
  allowedDependencies: string[]; // List of Layer names this layer is allowed to depend on
  level: number; // For strictly tiered architectures
}
