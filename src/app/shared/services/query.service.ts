import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Squel, Delete, Insert, Update } from 'squel';
import { escape } from 'sqlstring';

import { MysqlService } from './mysql.service';
import { MaxRow, MysqlResult, QueryForm, TableRow, ValueRow } from '../types/general';
import { squelConfig } from '../../config/squel.config';
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

  getSearchQuery(table: string, queryForm: QueryForm, selectFields: string[] = null, groupFields: string[] = null): string {
    const query = squel.select(squelConfig).from(table);

    if (selectFields) {
      query.fields(selectFields);
    }

    const filters = queryForm.fields;

    for (const filter in filters) {
      if (filters.hasOwnProperty(filter) && filters[filter] !== undefined && filters[filter] !== null) {
        const value = escape(`%${filters[filter]}%`);

        query.where(`\`${filter}\` LIKE ${value}`);
      }
    }

    if (groupFields) {
      for (const groupField of groupFields) {
        query.group(groupField);
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

  selectAllMultipleKeys<T extends TableRow>(
    table: string,
    row: Partial<T>,
  ): Observable<MysqlResult<T>> {
    const query = squel.select(squelConfig).from(table);

    for (const key in row) {
      /* istanbul ignore else */
      if (row.hasOwnProperty(key)) {
        query.where(`${key} = ${row[key]}`);
      }
    }

    return this.query<T>(query.toString());
  }

  getMaxId(table: string, idField: string): Observable<MysqlResult<MaxRow>> {
    return this.query<MaxRow>(
      `SELECT MAX(${idField}) AS max FROM ${table};`
    );
  }

  // UPDATE query without WHERE
  private getUpdateQueryBase<T extends TableRow>(
    tableName: string,  // the name of the table (example: 'creature_template')
    currentRow: T,      // object of the original row
    newRow: T,          // object of the new row
  ): Update {
    let diff = false;
    const query = squel.update(squelConfig)
      .table(tableName);

    for (const key in currentRow) {
      /* istanbul ignore else */
      if (currentRow.hasOwnProperty(key)) {
        if (currentRow[key] !== newRow[key]) {
          diff = true;
          query.set(key, newRow[key]);
        }
      }
    }

    return diff ? query : null;
  }

  // Tracks difference between two row objects and generate UPDATE query
  getUpdateQuery<T extends TableRow>(
    tableName: string,  // the name of the table (example: 'creature_template')
    primaryKey: string, // the key that uniquely identifies the row in the table
    currentRow: T,      // object of the original row
    newRow: T,          // object of the new row
  ): string {
    const query = this.getUpdateQueryBase(tableName, currentRow, newRow);

    if (!query) {
      return '';
    }

    query.where('`' + primaryKey + '` = ' + currentRow[primaryKey]);
    return `${query.toString()};`;
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

    return this.formatQuery(query);
  }

  private formatQuery(query: string): string {
    query = query.replace(') VALUES (', ') VALUES\n(');
    query = query.replace(/\), \(/g, '),\n(');
    return query;
  }

  // Tracks difference between two groups of rows (with TWO keys) and generate DELETE/INSERT query
  getDiffDeleteInsertTwoKeysQuery<T extends TableRow>(
    tableName: string,            // the name of the table (example: 'creature_loot_template')
    primaryKey1: string|string[], // first  primary key (example: 'Entry' or ['source_type', 'entryorguid'])
    primaryKey2: string,          // second primary key (example: 'Item')
    currentRows: T[],             // object of the original rows
    newRows: T[],                 // array of the new rows
  ): string {

    if (!newRows || !currentRows) { return ''; }
    if (newRows.length === 0 && currentRows.length === 0) {
      return this.QUERY_NO_CHANGES;
    }

    const deleteQuery: Delete = squel.delete(squelConfig).from(tableName);

    if (primaryKey1 && newRows.length === 0) {
      // all rows have been deleted
      if (Array.isArray(primaryKey1)) {
        this.addWhereConditionsToQuery(deleteQuery, currentRows[0], primaryKey1);
        return deleteQuery.toString();
      } else {
        return `DELETE FROM \`${tableName}\` WHERE \`${primaryKey1}\` = ${currentRows[0][primaryKey1]};\n`;
      }
    }

    const involvedRows: (string|number)[] = []; // -> needed for DELETE query
    const addedOrEditedRows: T[] = [];          // -> needed for INSERT query

    this.findEditedAndDeletedRows(primaryKey2, currentRows, newRows, involvedRows, addedOrEditedRows);
    this.findAddedRows(primaryKey2, currentRows, newRows, involvedRows, addedOrEditedRows);

    if ( involvedRows.length === 0 ) {
      return this.QUERY_NO_CHANGES;
    }
    const insertQuery: Insert = squel.insert(squelConfig).into(tableName);

    if (primaryKey1) {
      if (Array.isArray(primaryKey1)) {
        this.addWhereConditionsToQuery(deleteQuery, newRows[0], primaryKey1);
      } else {
        deleteQuery.where('`' + primaryKey1 + '` = ' + newRows[0][primaryKey1]);
      }
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
    grouped: boolean = false,   // whether the primaryKey2 is different for each row (e.g. primaryKey2='Item' in `creature_loot_template`)
                                // or is the same for all rows (e.g. primaryKey='entryorguid', primaryKey2='source_type' in `smart_scripts`)
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
      if (grouped) {
        deleteCondition += '`' + primaryKey2 + '` = ' + rows[0][primaryKey2];
      } else {
        const ids = rows.map(row => row[primaryKey2]);
        deleteCondition += '`' + primaryKey2 + '` IN (' + ids.join(', ') + ')';
      }
    }

    const deleteQuery: Delete = squel.delete(squelConfig).from(tableName).where(deleteCondition);
    const insertQuery: Insert = squel.insert(squelConfig).into(tableName).setFieldsRows(rows);

    let query: string = deleteQuery.toString() + ';\n';
    query += insertQuery.toString() + ';\n';
    return this.formatQuery(query);
  }

  private addWhereConditionsToQuery<T extends TableRow>(
    query: Delete | Update, // squel query object
    row: T,                 // the row, it MUST contain ALL the primaryKeys
    primaryKeys: string[],  // array of the primary keys
  ) {
    for (const key of primaryKeys) {
      query.where('`' + key + '` = ' + row[key]);
    }
  }

  // Generates the full UPDATE query of ONE row using more than 2 keys
  getUpdateMultipleKeysQuery<T extends TableRow>(
    tableName: string,     // the name of the table (example: 'conditions')
    currentRow: T,        // the original row, it MUST contain ALL the primaryKeys
    newRow: T,             // the original row, it MUST contain ALL the primaryKeys
    primaryKeys: string[], // array of the primary keys
  ) {
    const updateQuery: Update = this.getUpdateQueryBase(tableName, currentRow, newRow);
    if (!updateQuery) {
      return '';
    }
    this.addWhereConditionsToQuery(updateQuery, currentRow, primaryKeys);
    return updateQuery.toString();
  }

  // Generates the DELETE query of ONE row using more than 2 keys
  getDeleteMultipleKeysQuery<T extends TableRow>(
    tableName: string,     // the name of the table (example: 'conditions')
    row: T,                // the row, it MUST contain ALL the primaryKeys
    primaryKeys: string[], // array of the primary keys (example: ['SourceTypeOrReferenceId', 'SourceGroup', 'SourceEntry'])
  ) {
    const deleteQuery: Delete = squel.delete(squelConfig).from(tableName);
    this.addWhereConditionsToQuery(deleteQuery, row, primaryKeys);
    return deleteQuery.toString();
  }

  // Generates the full DELETE/INSERT query of ONE row using more than 2 keys
  getFullDeleteInsertMultipleKeysQuery<T extends TableRow>(
    tableName: string,     // the name of the table (example: 'conditions')
    currentRow: T,        // the original row, it MUST contain ALL the primaryKeys
    newRow: T,             // the original row, it MUST contain ALL the primaryKeys
    primaryKeys: string[], // array of the primary keys
  ) {
    const insertQuery: Insert = squel.insert(squelConfig).into(tableName).setFieldsRows([newRow]);
    let query: string = this.getDeleteMultipleKeysQuery(tableName, currentRow, primaryKeys) + ';\n';
    query += insertQuery.toString() + ';\n';
    return this.formatQuery(query);
  }

  // Input query format must be: SELECT something AS v FROM ...
  queryValue(query: string): Promise<string> {
    return this.query(query).pipe(
      map((data: MysqlResult<ValueRow>) => (data.results.length > 0) ? data.results[0].v : null),
    ).toPromise();
  }

  getCreatureNameById(id: string|number): Promise<string> {
    return this.queryValue(`SELECT name AS v FROM creature_template WHERE entry = ${id}`);
  }

  getCreatureNameByGuid(guid: string|number): Promise<string> {
    return this.queryValue(`SELECT name AS v FROM creature_template AS ct INNER JOIN creature AS c ON ct.entry = c.id WHERE c.guid = ${guid}`);
  }

  getGameObjectNameById(id: string|number): Promise<string> {
    return this.queryValue(`SELECT name AS v FROM gameobject_template WHERE entry = ${id}`);
  }

  getGameObjectNameByGuid(guid: string|number): Promise<string> {
    return this.queryValue(`SELECT name AS v FROM gameobject_template AS gt INNER JOIN gameobject AS g ON gt.entry = g.id WHERE g.guid = ${guid}`);
  }

  getQuestTitleById(id: string|number): Promise<string> {
    return this.queryValue(`SELECT LogTitle AS v FROM quest_template WHERE ID = ${id}`);
  }

  getItemNameById(id: string|number): Promise<string> {
    return this.queryValue(`SELECT name AS v FROM item_template WHERE entry = ${id}`);
  }

  // Note: at least one param should be defined
  getQuestTitleByCriteria(
    requiredNpcOrGo1: string|number|null,
    requiredNpcOrGo2: string|number|null,
    requiredNpcOrGo3: string|number|null,
    requiredNpcOrGo4: string|number|null,
    requiredSpellCast1: string|number|null = null,
  ): Promise<string> {
    const query = squel.select(squelConfig).fields({ LogTitle: 'v' }).from('quest_template');

    if (!!requiredNpcOrGo1) {
      query.where(`RequiredNpcOrGo1 = ${requiredNpcOrGo1}`);
    }
    if (!!requiredNpcOrGo2) {
      query.where(`RequiredNpcOrGo2 = ${requiredNpcOrGo2}`);
    }
    if (!!requiredNpcOrGo3) {
      query.where(`RequiredNpcOrGo3 = ${requiredNpcOrGo3}`);
    }
    if (!!requiredNpcOrGo4) {
      query.where(`RequiredNpcOrGo4 = ${requiredNpcOrGo4}`);
    }
    if (!!requiredSpellCast1) {
      query.where(`RequiredSpellCast1 = ${requiredSpellCast1}`);
    }

    return this.queryValue(query.toString());
  }
}
