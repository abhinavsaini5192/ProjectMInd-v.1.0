# Knowledge API Versioning

The current API is explicitly versioned as **v1**. 

Any breaking changes to the shape of `KnowledgeRequest` or `KnowledgeResponse` will necessitate the creation of `src/knowledge/api/v2/`.
The backend components (Query Engine, Symbol Engine, AST) can evolve indefinitely so long as the Gateway successfully maps their outputs to the stable v1 contract.
