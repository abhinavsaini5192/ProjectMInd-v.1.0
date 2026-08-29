# Relationship Types

ProjectMind models the entire architecture using deterministic relationship types.

## Structural
- `Contains`: When a Module contains a Class, or a Class contains a Method.

## Object-Oriented
- `Implements`: Interface adherence.
- `Extends`: Class inheritance.
- `Overrides`: Method overriding.

## Functional
- `Calls`: A function invoking another function.
- `Returns`: A function returning a specific type.
- `Instantiates`: The creation of an object instance.

## Module / Dependency
- `Imports`: Bringing external scope into a file.
- `Exports`: Exposing local scope to other files.
- `DependsOn`: Package or library-level dependencies.
