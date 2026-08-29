import { KuzuKnowledgeStore } from '../providers/KuzuKnowledgeStore';
import { GraphNode, GraphEdge } from '../models/GraphNode';

export class GraphBuilder {
  constructor(private store: KuzuKnowledgeStore) {}

  async addNode(table: string, node: GraphNode): Promise<void> {
    const conn = this.store.getConnection();
    const props = Object.keys(node.properties).map(k => `${k}: $${k}`).join(', ');
    const cypher = `CREATE (n:${table} {id: $id, ${props}})`;
    
    // Kuzu prepare and execute
    const stmt = await conn.prepare(cypher);
    await conn.execute(stmt, { id: node.id, ...node.properties });
  }

  async addEdge(table: string, edge: GraphEdge, fromTable: string, toTable: string): Promise<void> {
    const conn = this.store.getConnection();
    const cypher = `
      MATCH (a:${fromTable} {id: $source}), (b:${toTable} {id: $target})
      CREATE (a)-[e:${table}]->(b)
    `;
    const stmt = await conn.prepare(cypher);
    await conn.execute(stmt, { source: edge.sourceId, target: edge.targetId });
  }
}
