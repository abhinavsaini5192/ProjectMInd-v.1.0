# Knowledge Errors

To prevent leaking sensitive backend or AST failure logs, internal errors are intercepted at the Gateway and re-thrown as typed `KnowledgeError` objects using the following stable codes:

- `KNOWLEDGE_ENTITY_NOT_FOUND`
- `KNOWLEDGE_REPOSITORY_NOT_FOUND`
- `KNOWLEDGE_SNAPSHOT_NOT_FOUND`
- `KNOWLEDGE_ACCESS_DENIED`
- `KNOWLEDGE_QUERY_FAILED`
- `KNOWLEDGE_VERSION_UNSUPPORTED`
- `KNOWLEDGE_INVALID_REQUEST`
