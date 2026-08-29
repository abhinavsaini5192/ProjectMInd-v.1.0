export enum DependencyCategory {
  Code = 'Code',
  Module = 'Module',
  Package = 'Package',
  Runtime = 'Runtime',
  Database = 'Database',
  Configuration = 'Configuration',
  Build = 'Build',
  Test = 'Test',
  Plugin = 'Plugin',
  Documentation = 'Documentation',
  Environment = 'Environment',
  Container = 'Container',
  Infrastructure = 'Infrastructure',
  ExternalService = 'ExternalService',
  Feature = 'Feature', // Reserved for L2.6
  Unknown = 'Unknown'
}
