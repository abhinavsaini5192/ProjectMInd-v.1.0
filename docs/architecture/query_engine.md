# Repository Query Engine

The Repository Query Engine (L2.8) is the ultimate read boundary for ProjectMind v2.0's Knowledge Layer.

It shields the rest of the application (and the future Decision Engine) from having to know how data is stored, parsed, or traversed. It completely abstracts KuzuDB, SQLite, the AST, and file structures.

All queries are executed deterministically and return strongly-typed `IQueryResult` objects.
