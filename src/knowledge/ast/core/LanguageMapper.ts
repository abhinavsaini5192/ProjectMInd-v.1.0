import { NodeKind } from '../models/NodeKind';

/**
 * Deterministic dictionaries for mapping parser-specific nodes to Universal nodes.
 * We use TS dictionaries for performance and type safety over JSON configs.
 */
export const LanguageMappingRules: Record<string, Record<string, NodeKind>> = {
  typescript: {
    'program': NodeKind.File,
    'class_declaration': NodeKind.Class,
    'method_definition': NodeKind.Method,
    'function_declaration': NodeKind.Function,
    'interface_declaration': NodeKind.Interface,
    'enum_declaration': NodeKind.Enum,
    'lexical_declaration': NodeKind.Variable,
    'import_statement': NodeKind.Import,
    'export_statement': NodeKind.Export,
    'decorator': NodeKind.Decorator,
    'comment': NodeKind.Comment
  },
  python: {
    'module': NodeKind.File,
    'class_definition': NodeKind.Class,
    'function_definition': NodeKind.Function, // Maps to Method inside a class, handled by Normalizer context
    'import_statement': NodeKind.Import,
    'import_from_statement': NodeKind.Import,
    'decorator': NodeKind.Decorator,
    'comment': NodeKind.Comment
  },
  java: {
    'program': NodeKind.File,
    'class_declaration': NodeKind.Class,
    'method_declaration': NodeKind.Method,
    'interface_declaration': NodeKind.Interface,
    'enum_declaration': NodeKind.Enum,
    'import_declaration': NodeKind.Import,
    'marker_annotation': NodeKind.Annotation,
    'annotation': NodeKind.Annotation,
    'block_comment': NodeKind.Comment,
    'line_comment': NodeKind.Comment
  }
};
