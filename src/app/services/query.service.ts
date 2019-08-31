import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Squel, Delete, Insert } from 'squel';
import { escape } from 'sqlstring';

import { MysqlService } from './mysql.service';
import { MaxRow, MysqlResult, QueryForm, TableRow } from '../types/general';
import { squelConfig } from '../config/squel.config';
import { ConfigService } from './config.service';

declare const squel: Squel & {flavour: null};

@Injectable({
  providedIn: 'root'
})
export class QueryService {

  private readonly QUERY_NO_CHANGES = '-- There are no changes';

  constructor(
    private mysqlService: MysqlService,
    private configService: ConfigService,
  ) { }

  query<T extends TableRow>(queryString: string, values?: string[]): Observable<MysqlResult<T>> {
    return this.mysqlService.dbQuery<T>(queryString, values).pipe(
      tap(val => {
        if (this.configService.debugMode) {
          console.log(`\n${queryString}`);
          console.log(val);
        }
      })
    );
  }

  getSearchQuery(table: string, queryForm: QueryForm) {
    const query = squel.select(squelConfig).from(table);
    const filters = queryForm.fields;

    for (const filter in filters) {
      if (filters.hasOwnProperty(filter) && !!filters[filter]) {
        const value = escape(`%${filters[filter]}%`);

        query.where(`\`${filter}\` LIKE ${value}`);
      }
    }

    if (queryForm.limit) {
      query.limit(Number.parseInt(queryForm.limit, 10));
    }

    return query.toString();
  }

  selectAll<T extends TableRow>(
    table: string,
    idField: string,
    idValue: string|number,
  ): Observable<MysqlResult<T>> {
    return this.query<T>(
      squel.select(squelConfig).from(table).where(`${idField} = ${idValue}`).toString()
    );
  }

  getMaxId(table: string, idField: string): Observable<MysqlResult<MaxRow>> {
    return this.query<MaxRow>(
      `SELECT MAX(${idField}) AS max FROM ${table};`
    );
  }

  /* -------------------------------- Keira2 imports -------------------------------- */

  // Tracks difference between two row objects and generate UPDATE query
  getUpdateQuery<T extends TableRow>(
    tableName: string,  // the name of the table (example: 'creature_template')
    primaryKey: string, // the key that uniquely identifies the row in the table
    currentRow: T,      // object of the original row
    newRow: T,          // object of the new row
  ): string {
    let diff = false;
    const query = squel.update(squelConfig)
      .table(tableName)
      .where('`' + primaryKey + '` = ' + currentRow[primaryKey]);

    for (const key in currentRow) {
      /* istanbul ignore else */
      if (currentRow.hasOwnProperty(key)) {
        if (currentRow[key] !== newRow[key]) {
          diff = true;
          query.set(key, newRow[key]);
        }
      }
    }

    return diff ? `${query.toString()};` : '';
  }

  private getRow<T extends TableRow>(
    key: string,
    object: T,
    array: T[],
  ): T {
    for (let i = 0; i < array.length; i++) {
      if (array[i][key] === object[key]) {
        return array[i];
      }
    }
    return null;
  }

  private findEditedAndDeletedRows<T extends TableRow>(
    key: string,
    currentRows: T[],
    newRows: T[],
    involvedRows: (string|number)[],
    addedOrEditedRows: T[],
  ): void {
    for (let i = 0; i < currentRows.length; i++) {
      const row = this.getRow(key, currentRows[i], newRows);
      if (!row) {
        // the row has been deleted
        involvedRows.push(currentRows[i][key]);
      } else if (JSON.stringify(row) !== JSON.stringify(currentRows[i])) {
        // the row has been edited
        involvedRows.push(row[key]);
        addedOrEditedRows.push(row);
      }
    }
  }

  private findAddedRows<T extends TableRow>(
    key: string,
    currentRows: T[],
    newRows: T[],
    involvedRows: (string|number)[],
    addedOrEditedRows: T[],
  ): void {
    for (let i = 0; i < newRows.length; i++) {
      if (!this.getRow(key, newRows[i], currentRows)) {
        involvedRows.push(newRows[i][key]);
        addedOrEditedRows.push(newRows[i]);
      }
    }
  }

  private getFinalDiffDeleteInsertQuery<T extends TableRow>(
    addedOrEditedRows: T[],
    deleteQuery: Delete,
    insertQuery: Insert,
  ): string {
    let query = deleteQuery.toString() + ';\n';

    if (addedOrEditedRows.length > 0) {
      query += insertQuery.toString() + ';\n';
    }

    query = query.replace(') VALUES (', ') VALUES\n(');
    query = query.replace(/\), \(/g, '),\n(');
    return query;
  }

  // Tracks difference between two groups of rows (with TWO keys) and generate DELETE/INSERT query
  getDiffDeleteInsertTwoKeysQuery<T extends TableRow>(
    tableName: string,        // the name of the table (example: 'creature_loot_template')
    primaryKey1: string|null, // first  primary key (example: 'Entry')
    primaryKey2: string,      // second primary key (example: 'Item')
    currentRows: T[],         // object of the original rows
    newRows: T[],             // array of the new rows
  ): string {

    if (!newRows || !currentRows) { return ''; }
    if (newRows.length === 0 && currentRows.length === 0) {
      return this.QUERY_NO_CHANGES;
    }

    if (primaryKey1 && newRows.length === 0) {
      // all rows have been deleted
      return `DELETE FROM \`${tableName}\` WHERE \`${primaryKey1}\` = ${currentRows[0][primaryKey1]};\n`;
    }

    const involvedRows: (string|number)[] = []; // -> needed for DELETE query
    const addedOrEditedRows: T[] = [];          // -> needed for INSERT query

    this.findEditedAndDeletedRows(primaryKey2, currentRows, newRows, involvedRows, addedOrEditedRows);
    this.findAddedRows(primaryKey2, currentRows, newRows, involvedRows, addedOrEditedRows);

    if ( involvedRows.length === 0 ) {
      return this.QUERY_NO_CHANGES;
    }

    const deleteQuery: Delete = squel.delete(squelConfig).from(tableName);
    const insertQuery: Insert = squel.insert(squelConfig).into(tableName);

    if (primaryKey1) {
      deleteQuery.where('`' + primaryKey1 + '` = ' + newRows[0][primaryKey1]);
    }
    deleteQuery.where('`' + primaryKey2 + '` IN ?', involvedRows);

    insertQuery.setFieldsRows(addedOrEditedRows);

    return this.getFinalDiffDeleteInsertQuery(addedOrEditedRows, deleteQuery, insertQuery);
  }

  // Tracks difference between two groups of rows (with ONE key) and generate DELETE/INSERT query
  getDiffDeleteInsertOneKeyQuery<T extends TableRow>(
    tableName: string,  // the name of the table (example: 'creature_addon')
    primaryKey: string, // name of the primary key (example: 'guid')
    currentRows: T[],   // object of the original rows
    newRows: T[],       // array of the new rows
  ): string {
    if (!newRows || !currentRows) { return ''; }

    const involvedRows: (string|number)[] = []; // -> needed for DELETE query
    const addedOrEditedRows: T[] = [];          // -> needed for INSERT query

    this.findEditedAndDeletedRows(primaryKey, currentRows, newRows, involvedRows, addedOrEditedRows);
    this.findAddedRows(primaryKey, currentRows, newRows, involvedRows, addedOrEditedRows);

    if ( involvedRows.length === 0 ) {
      return this.QUERY_NO_CHANGES;
    }

    const deleteQuery: Delete = squel.delete(squelConfig).from(tableName);
    const insertQuery: Insert = squel.insert(squelConfig).into(tableName);

    deleteQuery.where('`' + primaryKey + '` IN ?', involvedRows);
    insertQuery.setFieldsRows(addedOrEditedRows);

    return this.getFinalDiffDeleteInsertQuery(addedOrEditedRows, deleteQuery, insertQuery);
  }

  // Generates the full DELETE/INSERT query of a group of rows using one or two keys
  getFullDeleteInsertQuery<T extends TableRow>(
    tableName: string,          // the name of the table (example: 'creature_loot_template')
    rows: T[],                  // array of the new rows
    primaryKey: string = null,  // first primary key (example: 'Entry'), it will be used to generate the DELETE statement for ALL rows
    primaryKey2: string = null, // the second primary key, it will be used to generate the DELETE statement for SPECIFIC rows
  ) {
    if (!rows || rows.length === 0) { return ''; }

    let deleteCondition: string = '';

    if (primaryKey) {
      deleteCondition += '`' + primaryKey + '` = ' + rows[0][primaryKey];
    }
    if (primaryKey && primaryKey2) {
      deleteCondition += ` AND `;
    }
    if (primaryKey2) {
      const ids = rows.map(row => row[primaryKey2]);
      deleteCondition += '`' + primaryKey2 + '` IN (' + ids.join(', ') + ')';
    }

    const deleteQuery: Delete = squel.delete(squelConfig).from(tableName).where(deleteCondition);
    const insertQuery: Insert = squel.insert(squelConfig).into(tableName).setFieldsRows(rows);

    let query: string = deleteQuery.toString() + ';\n';
    query += insertQuery.toString() + ';\n';
    query = query.replace(') VALUES (', ') VALUES\n(');
    query = query.replace(/\), \(/g, '),\n(');

    return query;
  }
}
