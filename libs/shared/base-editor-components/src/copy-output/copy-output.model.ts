export type CopyMode = 'RAW' | 'ALL';

export interface RelatedTable {
  tableName: string;
  idField: string;
  copyMode?: CopyMode;
  columns?: string[];
}

export interface RelatedTableState {
  tableName: string;
  idField: string;
  count: number;
  included: boolean;
  copyMode: CopyMode;
  columns?: string[];
}
