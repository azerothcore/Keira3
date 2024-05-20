import { Injectable } from '@angular/core';
import { SmartScripts } from '@keira/shared/acore-world-model';
import { from, map, Observable, of, tap } from 'rxjs';
import { Delete, Insert, Squel, Update } from 'squel';
import { squelConfig } from '@keira/shared/config';
import { MaxRow, QuestReputationReward, TableRow } from '@keira/shared/constants';
import { ConfigService } from '@keira/shared/common-services';
import { MysqlService } from '../mysql.service';
import { BaseQueryService } from './base-query.service';

declare const squel: Squel & { flavour: null };

@Injectable({
  providedIn: 'root',
})
export class MysqlQueryService extends BaseQueryService {
  constructor(
    private mysqlService: MysqlService,
    private configService: ConfigService,
  ) {
    super();
  }

  clearCache(): void {
    this.cache.clear();
  }

  query<T extends TableRow>(queryString: string, values?: string[]): Observable<T[]> {
    return this.mysqlService.dbQuery<T>(queryString, values).pipe(
      tap((val) => {
        if (this.configService.debugMode) {
          console.log(`\n${queryString}`);
          console.log(val);
        }
      }),
      map((val) => val?.result),
    ) as Observable<T[]>;
  }

  selectAll<T extends TableRow>(table: string, idField: string, idValue: string | number): Observable<T[]> {
    return this.query<T>(squel.select(squelConfig).from(table).where(`${idField} = ${idValue}`).toString());
  }

  selectAllMultipleKeys<T extends TableRow>(table: string, row: Partial<T>): Observable<T[]> {
    const query = squel.select(squelConfig).from(table);

    for (const key in row) {
      query.where(`${key} = ${row[key]}`);
    }

    return this.query<T>(query.toString());
  }

  getMaxId(table: string, idField: string): Observable<MaxRow[]> {
    return this.query<MaxRow>(`SELECT MAX(${idField}) AS max FROM ${table};`);
  }

  // UPDATE query without WHERE
  private getUpdateQueryBase<T extends TableRow>(
    tableName: string, // the name of the table (example: 'creature_template')
    currentRow: T, // object of the original row
    newRow: T, // object of the new row
  ): Update | undefined {
    let diff = false;
    const query = squel.update(squelConfig).table(tableName);

    for (const key in currentRow) {
      if (currentRow[key] !== newRow[key]) {
        diff = true;
        query.set(key, newRow[key]);
      }
    }

    return diff ? query : undefined;
  }

  // Tracks difference between two row objects and generate UPDATE query
  getUpdateQuery<T extends TableRow>(
    tableName: string, // the name of the table (example: 'creature_template')
    primaryKey: string, // the key that uniquely identifies the row in the table
    currentRow: T, // object of the original row
    newRow: T, // object of the new row
  ): string {
    const query = this.getUpdateQueryBase(tableName, currentRow, newRow);

    if (!query) {
      return '';
    }

    query.where('`' + primaryKey + '` = ' + currentRow[primaryKey]);
    return `${query.toString()};`;
  }

  private getRow<T extends TableRow>(key: string, object: T, array: T[]): T | undefined {
    for (let i = 0; i < array.length; i++) {
      if (array[i][key] === object[key]) {
        return array[i];
      }
    }

    return undefined;
  }

  private findEditedAndDeletedRows<T extends TableRow>(
    key: string,
    currentRows: T[],
    newRows: T[],
    involvedRows: (string | number)[],
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
    involvedRows: (string | number)[],
    addedOrEditedRows: T[],
  ): void {
    for (let i = 0; i < newRows.length; i++) {
      if (!this.getRow(key, newRows[i], currentRows)) {
        involvedRows.push(newRows[i][key]);
        addedOrEditedRows.push(newRows[i]);
      }
    }
  }

  private getFinalDiffDeleteInsertQuery<T extends TableRow>(addedOrEditedRows: T[], deleteQuery: Delete, insertQuery: Insert): string {
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
    tableName: string, // the name of the table (example: 'creature_loot_template')
    primaryKey1: string | string[] | undefined, // first  primary key (example: 'Entry' or ['source_type', 'entryorguid'])
    primaryKey2: string, // second primary key (example: 'Item')
    currentRows: T[] | undefined, // object of the original rows
    newRows: T[] | undefined, // array of the new rows
  ): string {
    if (!newRows || !currentRows) {
      return '';
    }
    if (newRows.length === 0 && currentRows.length === 0) {
      return '';
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

    const involvedRows: (string | number)[] = []; // -> needed for DELETE query
    const addedOrEditedRows: T[] = []; // -> needed for INSERT query

    this.findEditedAndDeletedRows(primaryKey2, currentRows, newRows, involvedRows, addedOrEditedRows);
    this.findAddedRows(primaryKey2, currentRows, newRows, involvedRows, addedOrEditedRows);

    if (involvedRows.length === 0) {
      return '';
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
    tableName: string, // the name of the table (example: 'creature_addon')
    primaryKey: string, // name of the primary key (example: 'guid')
    currentRows: T[] | undefined, // object of the original rows
    newRows: T[] | undefined, // array of the new rows
  ): string {
    if (!newRows || !currentRows) {
      return '';
    }

    const involvedRows: (string | number)[] = []; // -> needed for DELETE query
    const addedOrEditedRows: T[] = []; // -> needed for INSERT query

    this.findEditedAndDeletedRows(primaryKey, currentRows, newRows, involvedRows, addedOrEditedRows);
    this.findAddedRows(primaryKey, currentRows, newRows, involvedRows, addedOrEditedRows);

    if (involvedRows.length === 0) {
      return '';
    }

    const deleteQuery: Delete = squel.delete(squelConfig).from(tableName);
    const insertQuery: Insert = squel.insert(squelConfig).into(tableName);

    deleteQuery.where('`' + primaryKey + '` IN ?', involvedRows);
    insertQuery.setFieldsRows(addedOrEditedRows);

    return this.getFinalDiffDeleteInsertQuery(addedOrEditedRows, deleteQuery, insertQuery);
  }

  // Generates the full DELETE/INSERT query of a group of rows using one or two keys
  getFullDeleteInsertQuery<T extends TableRow>(
    tableName: string, // the name of the table (example: 'creature_loot_template')
    rows: T[] | undefined, // array of the new rows
    primaryKey: string | null = null, // first primary key (example: 'Entry'), it will be used to generate the DELETE statement for ALL rows
    primaryKey2: string | null = null, // the second primary key, it will be used to generate the DELETE statement for SPECIFIC rows
    grouped: boolean = false, // whether the primaryKey2 is different for each row (e.g. primaryKey2='Item' in `creature_loot_template`)
    // or is the same for all rows (e.g. primaryKey='entryorguid', primaryKey2='source_type' in `smart_scripts`)
  ) {
    if (!rows || rows.length === 0) {
      return '';
    }

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
        const ids = rows.map((row) => row[primaryKey2]);
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
    row: T, // the row, it MUST contain ALL the primaryKeys
    primaryKeys: string[], // array of the primary keys
  ) {
    for (const key of primaryKeys) {
      query.where('`' + key + '` = ' + row[key]);
    }
  }

  // Generates the full UPDATE query of ONE row using more than 2 keys
  getUpdateMultipleKeysQuery<T extends TableRow>(
    tableName: string, // the name of the table (example: 'conditions')
    currentRow: T, // the original row, it MUST contain ALL the primaryKeys
    newRow: T, // the original row, it MUST contain ALL the primaryKeys
    primaryKeys: string[], // array of the primary keys
  ) {
    const updateQuery = this.getUpdateQueryBase(tableName, currentRow, newRow);
    if (!updateQuery) {
      return '';
    }
    this.addWhereConditionsToQuery(updateQuery, currentRow, primaryKeys);
    return updateQuery.toString();
  }

  // Generates the DELETE query of ONE row using more than 2 keys
  getDeleteMultipleKeysQuery<T extends TableRow>(
    tableName: string, // the name of the table (example: 'conditions')
    row: T, // the row, it MUST contain ALL the primaryKeys
    primaryKeys: string[], // array of the primary keys (example: ['SourceTypeOrReferenceId', 'SourceGroup', 'SourceEntry'])
  ) {
    const deleteQuery: Delete = squel.delete(squelConfig).from(tableName);
    this.addWhereConditionsToQuery(deleteQuery, row, primaryKeys);
    return deleteQuery.toString();
  }

  // Generates the full DELETE/INSERT query of ONE row using more than 2 keys
  getFullDeleteInsertMultipleKeysQuery<T extends TableRow>(
    tableName: string, // the name of the table (example: 'conditions')
    currentRow: T, // the original row, it MUST contain ALL the primaryKeys
    newRow: T, // the original row, it MUST contain ALL the primaryKeys
    primaryKeys: string[], // array of the primary keys
  ) {
    const insertQuery: Insert = squel.insert(squelConfig).into(tableName).setFieldsRows([newRow]);
    let query: string = this.getDeleteMultipleKeysQuery(tableName, currentRow, primaryKeys) + ';\n';
    query += insertQuery.toString() + ';\n';
    return this.formatQuery(query);
  }

  getTimedActionlists(creatureId: string | number): Observable<SmartScripts[]> {
    const startId = +creatureId * 100;
    return this.query<SmartScripts>(
      `SELECT * FROM smart_scripts WHERE source_type = 9 AND entryorguid >= ${startId} AND entryorguid < ${startId + 100}`,
    );
  }

  getCreatureNameById(id: string | number): Promise<string> {
    return this.queryValueToPromiseCached('getCreatureNameById', String(id), `SELECT name AS v FROM creature_template WHERE entry = ${id}`);
  }

  getCreatureNameByGuid(guid: string | number): Promise<string> {
    return this.queryValueToPromiseCached(
      'getCreatureNameByGuid',
      String(guid),
      `SELECT name AS v FROM creature_template AS ct INNER JOIN creature AS c ON ct.entry = c.id1 WHERE c.guid = ${guid}`,
    );
  }

  getGameObjectNameById(id: string | number): Promise<string> {
    return this.queryValueToPromiseCached(
      'getGameObjectNameById',
      String(id),
      `SELECT name AS v FROM gameobject_template WHERE entry = ${id}`,
    );
  }

  getGameObjectNameByGuid(guid: string | number): Promise<string> {
    return this.queryValueToPromiseCached(
      'getGameObjectNameByGuid',
      String(guid),
      `SELECT name AS v FROM gameobject_template AS gt INNER JOIN gameobject AS g ON gt.entry = g.id WHERE g.guid = ${guid}`,
    );
  }

  getQuestTitleById(id: string | number): Promise<string> {
    return this.queryValueToPromiseCached('getQuestTitleById', String(id), `SELECT LogTitle AS v FROM quest_template WHERE ID = ${id}`);
  }

  getPrevQuestById(id: string | number): Promise<string> {
    return this.queryValueToPromiseCached(
      'getPrevQuestById',
      String(id),
      `SELECT PrevQuestID AS v FROM quest_template_addon WHERE id = ${id}`,
    );
  }

  getNextQuestById(id: string | number, usingPrev = false): Promise<string> {
    return usingPrev
      ? this.queryValueToPromiseCached('getNextQuest1', String(id), `SELECT id AS v FROM quest_template_addon WHERE PrevQuestID = ${id}`)
      : this.queryValueToPromiseCached('getNextQuest2', String(id), `SELECT NextQuestID AS v FROM quest_template_addon WHERE id = ${id}`);
  }

  getItemByStartQuest(id: string | number): Promise<string> {
    return this.queryValueToPromiseCached(
      'getItemByStartQuest',
      String(id),
      `SELECT entry AS v FROM item_template WHERE startquest = ${id}`,
    );
  }

  getItemNameByStartQuest(id: string | number): Promise<string> {
    return this.queryValueToPromiseCached(
      'getItemNameByStartQuest',
      String(id),
      `SELECT name AS v FROM item_template WHERE startquest = ${id}`,
    );
  }

  getItemNameById(id: string | number): Promise<string> {
    return this.queryValueToPromiseCached('getItemNameById', String(id), `SELECT name AS v FROM item_template WHERE entry = ${id}`);
  }

  getDisplayIdByItemId(id: string | number | undefined): Observable<string | number | undefined> {
    return !!id
      ? from(
          this.queryValueToPromiseCached(
            'getDisplayIdByItemId',
            String(id),
            `SELECT displayid AS v FROM item_template WHERE entry = ${id}`,
          ),
        )
      : of(undefined);
  }

  // Note: at least one param should be defined
  getQuestTitleByCriteria(
    requiredNpcOrGo1: string | number | null,
    requiredNpcOrGo2: string | number | null,
    requiredNpcOrGo3: string | number | null,
    requiredNpcOrGo4: string | number | null,
    requiredSpellCast1: string | number | null = null,
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

    return this.queryValueToPromise(query.toString()) as Promise<string>;
  }

  getReputationRewardByFaction(id: string | number): Promise<QuestReputationReward[]> {
    return this.queryToPromiseCached<QuestReputationReward>(
      'getReputationRewardByFaction',
      String(id),
      `SELECT * FROM reputation_reward_rate WHERE faction = ${id}`,
    );
  }

  getText0ById(id: string | number): Promise<string> {
    return this.queryValueToPromiseCached('getText0ById', String(id), `SELECT text0_0 AS v FROM npc_text WHERE ID = ${id}`);
  }

  getText1ById(id: string | number): Promise<string> {
    return this.queryValueToPromiseCached('getText1ById', String(id), `SELECT text0_1 AS v FROM npc_text WHERE ID = ${id}`);
  }
}
