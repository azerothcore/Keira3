import { TableRow } from '@keira/shared/constants';
import { QueryError } from 'mysql2';

export interface SqlTabResult {
  rows: TableRow[];
  columns: string[];
  affectedRows: number;
  message: string;
  error: QueryError | undefined;
}

export interface SqlTab {
  id: string;
  title: string;
  code: string;
  dirty?: boolean;
  path?: string;
  isNew?: boolean;
  savedCode?: string;
  result?: SqlTabResult;
}
