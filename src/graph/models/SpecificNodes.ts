import { GraphNode } from './GraphNode';

export interface SymbolNode extends GraphNode {
  label: 'Symbol';
  properties: {
    name: string;
    type: string;
    filePath: string;
    lineStart: number;
    lineEnd: number;
    isExported: boolean;
  };
}

export interface ModuleNode extends GraphNode {
  label: 'Module';
  properties: {
    name: string;
    filePath: string;
  };
}

export interface ClassNode extends GraphNode {
  label: 'Class';
  properties: {
    name: string;
    filePath: string;
    isAbstract: boolean;
  };
}

export interface FunctionNode extends GraphNode {
  label: 'Function';
  properties: {
    name: string;
    filePath: string;
    isAsync: boolean;
  };
}

export interface InterfaceNode extends GraphNode {
  label: 'Interface';
  properties: {
    name: string;
    filePath: string;
  };
}

export interface PackageNode extends GraphNode {
  label: 'Package';
  properties: {
    name: string;
    version: string;
  };
}
