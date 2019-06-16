import { FieldInfo } from 'mysql';

export interface QueryForm {
  limit?: string;
  fields?: {
    [key: string]: string;
  };
}

export interface MysqlResult<T extends TableRow> {
  results?: T[];
  fields?: FieldInfo[];
}

export class TableRow {
  [key: string]: string|number;
}

export interface MaxRow extends TableRow {
  max: number;
}

export type Class = new(...args: any[]) => any;
