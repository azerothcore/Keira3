import { FieldInfo } from 'mysql';

export interface QueryForm {
  limit?: string;
  fields?: {
    [key: string]: string;
  };
}

export type Class = new(...args: any[]) => any;

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

export interface VersionRow extends TableRow {
  core_version: string;
  core_revision: string;
  db_version: string;
  cache_id: number;
}

export interface VersionDbRow extends TableRow {
  [key: string]: number;
}

export interface Flag {
  bit: number; // the position (index) of the bit
  name: string;
}

export interface Option {
  value: number|string;
  name: string;
}

export interface FieldDefinition {
  name: string;
  tooltip: string;
}
