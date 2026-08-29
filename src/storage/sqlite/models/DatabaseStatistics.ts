export interface DatabaseStatistics {
  databaseName: string;
  sizeBytes: number;
  tableCount: number;
  indexCount: number;
  pageCount: number;
  pageSize: number;
  walSize?: number;
}
