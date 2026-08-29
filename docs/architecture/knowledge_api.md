# Knowledge API

The Knowledge API is the ultimate, versioned, read-only boundary sitting on top of the Knowledge Layer (L2). 
It completely encapsulates the Query Engine and all underlying KuzuDB/SQLite database storage, ensuring higher-level systems (such as the Decision Engine) receive deterministic payloads wrapped in a standard `KnowledgeResponse`.
