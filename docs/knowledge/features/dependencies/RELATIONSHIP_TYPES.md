# Semantic Relationship Types

ProjectMind defines **18 semantic relationship types** between features, representing high-level capability interactions rather than simple AST-level import links:

| Type | Direction | Description | Typical Source |
|---|---|---|---|
| `DEPENDS_ON` | `DIRECTED` | Feature A requires Feature B to function. | `CodeDependencySource`, `EndpointInteractionSource`, `ModuleDependencySource` |
| `REQUIRED_BY` | `DIRECTED` | Reciprocal relationship of `DEPENDS_ON`. | Inverse projection |
| `PROVIDES` | `DIRECTED` | Feature A provides capability/foundation to Feature B. | `ArchitectureDependencySource` |
| `CONSUMES` | `DIRECTED` | Feature A invokes or consumes endpoints/services from Feature B. | `EndpointInteractionSource`, `IntegrationDependencySource` |
| `USES` | `DIRECTED` | Feature A queries, reads, or references schema owned by Feature B. | `DataDependencySource` |
| `INTEGRATES_WITH` | `UNDIRECTED` / `DIRECTED` | Features communicate via configuration or external adapter. | `ConfigurationDependencySource` |
| `EXTENDS` | `DIRECTED` | Feature A adds capabilities or hooks to Feature B. | `CodeDependencySource` |
| `SPECIALIZES` | `DIRECTED` | Feature A is a concrete implementation of abstract Feature B. | Architecture & Code sources |
| `COMPOSES` | `DIRECTED` | Feature A aggregates or embeds Feature B as a submodule. | `ModuleDependencySource` |
| `COORDINATES` | `UNDIRECTED` | Features orchestrate workflows collaboratively. | `ModuleDependencySource` |
| `SHARES_RESOURCE` | `BIDIRECTIONAL` | Features share an underlying file, utility, or technical asset. | `SharedResourceSource` |
| `SHARES_DATA` | `BIDIRECTIONAL` | Features share a common database entity or persistent model. | `DataDependencySource` |
| `AUTHORIZES` | `DIRECTED` | Feature A gates access or enforces permissions on Feature B. | `EndpointInteractionSource` |
| `TRIGGERS` | `DIRECTED` | Feature A emits an asynchronous event that executes Feature B. | `IntegrationDependencySource` |
| `FEEDS` | `DIRECTED` | Feature A generates continuous data streams ingested by Feature B. | `IntegrationDependencySource` |
| `OBSERVES` | `DIRECTED` | Feature A monitors metrics, traces, or events of Feature B. | Architecture & Telemetry sources |
| `VERIFIES` | `DIRECTED` | Feature A contains tests or assertions verifying Feature B. | `TestRelationshipSource` |
| `ASSOCIATED_WITH` | `UNDIRECTED` | Features exhibit statistical co-change correlation in Git history. | `HistoryRelationshipSource` |

---

## Dominant Type Selection Hierarchy

When multiple sources propose differing relationship types for the same directed edge, the resolver evaluates type priority:

```
DEPENDS_ON (100)
 └─► USES (90)
      └─► CONSUMES (85)
           └─► PROVIDES (80)
                └─► INTEGRATES_WITH (75)
                     └─► TRIGGERS (70)
                          └─► SHARES_RESOURCE (65)
                               └─► SHARES_DATA (60)
                                    └─► COORDINATES (55)
                                         └─► EXTENDS (50)
                                              └─► SPECIALIZES (45)
                                                   └─► COMPOSES (40)
                                                        └─► AUTHORIZES (35)
                                                             └─► FEEDS (30)
                                                                  └─► OBSERVES (25)
                                                                       └─► VERIFIES (20)
                                                                            └─► REQUIRED_BY (15)
                                                                                 └─► ASSOCIATED_WITH (10)
```
