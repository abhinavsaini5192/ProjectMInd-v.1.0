# Knowledge Graph Schema

KuzuDB enforces strict Node and Relationship definitions. ProjectMind adheres to the following Cypher DDL representation:

## Node Tables
- `File(id STRING, path STRING, PRIMARY KEY(id))`
- `Module(id STRING, name STRING, PRIMARY KEY(id))`
- `Symbol(id STRING, name STRING, type STRING, PRIMARY KEY(id))`

## Relationship Tables
- `CONTAINS(FROM File TO Module, FROM Module TO Symbol)`
- `DEPENDS_ON(FROM Module TO Module, FROM File TO File)`
- `CALLS(FROM Symbol TO Symbol)`

*(Additional schemas for `Package`, `Task`, `Memory` and relationships like `inherits`, `implements` will be expanded in future builder phases).*
