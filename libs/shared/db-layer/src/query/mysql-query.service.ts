import { inject, Service } from '@angular/core';
import {
  BROADCAST_TEXT_TABLE,
  CONDITION_SOURCE_TYPES,
  QUEST_PREREQUISITE_CONDITION_TYPES,
  SmartScripts,
} from '@keira/shared/acore-world-model';
import { ConfigService } from '@keira/shared/common-services';
import { squelConfig } from '@keira/shared/config';
import {
  MaxRow,
  QuestChainRelationRow,
  QuestConditionCountRow,
  QuestConditionPrerequisiteRow,
  QuestReputationReward,
  QuestTitleRow,
  SmartEventConditionCountRow,
  TableRow,
} from '@keira/shared/constants';
import { from, map, Observable, of, tap } from 'rxjs';
import squel, { Delete, Insert, Update } from 'squel';
import { MysqlService } from '../mysql.service';
import { BaseQueryService } from './base-query.service';

@Service()
export class MysqlQueryService extends BaseQueryService {
  private mysqlService = inject(MysqlService);
  private configService = inject(ConfigService);

  clearCache(): void {
    this.cache.clear();
  }

  query<T extends TableRow>(queryString: string, values?: string[]): Observable<T[]> {
    return this.mysqlService.dbQuery<T>(queryString, values).pipe(
      tap((val) => {
        if (this.configService.debugMode()) {
          console.info(`\n${queryString}`);
          console.info(val);
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

  private hasSameRowKey<T extends TableRow>(rowA: T, rowB: T, key: string, extraKey: string | undefined): boolean {
    if (rowA[key] !== rowB[key]) {
      return false;
    }

    // Without an extra key, `key` alone identifies the row.
    return !extraKey || rowA[extraKey] === rowB[extraKey];
  }

  private getRow<T extends TableRow>(key: string, object: T, array: T[], extraKey?: string): T | undefined {
    for (let i = 0; i < array.length; i++) {
      if (this.hasSameRowKey(array[i], object, key, extraKey)) {
        return array[i];
      }
    }

    return undefined;
  }

  // Several rows can share the same `key` when an extra key is in play, so the same id must not be
  // listed twice in the DELETE.
  private addInvolvedRow(involvedRows: (string | number)[], id: string | number): void {
    if (!involvedRows.includes(id)) {
      involvedRows.push(id);
    }
  }

  private findEditedAndDeletedRows<T extends TableRow>(
    key: string,
    currentRows: T[],
    newRows: T[],
    involvedRows: (string | number)[],
    addedOrEditedRows: T[],
    extraKey?: string,
  ): void {
    for (let i = 0; i < currentRows.length; i++) {
      const row = this.getRow(key, currentRows[i], newRows, extraKey);
      if (!row) {
        // the row has been deleted
        this.addInvolvedRow(involvedRows, currentRows[i][key]);
      } else if (JSON.stringify(row) !== JSON.stringify(currentRows[i])) {
        // the row has been edited
        this.addInvolvedRow(involvedRows, row[key]);
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
    extraKey?: string,
  ): void {
    for (let i = 0; i < newRows.length; i++) {
      if (!this.getRow(key, newRows[i], currentRows, extraKey)) {
        this.addInvolvedRow(involvedRows, newRows[i][key]);
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
    extraIdField?: string, // third primary key, when `primaryKey2` alone is not unique (example: creature_text 'ID')
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

    this.findEditedAndDeletedRows(primaryKey2, currentRows, newRows, involvedRows, addedOrEditedRows, extraIdField);
    this.findAddedRows(primaryKey2, currentRows, newRows, involvedRows, addedOrEditedRows, extraIdField);

    if (involvedRows.length === 0) {
      return '';
    }

    // With an extra key, one `primaryKey2` covers a whole group of rows and the DELETE wipes the
    // group as a unit, so every row the group should still hold must be inserted back - not only
    // the ones that changed, otherwise the untouched siblings would be dropped.
    const rowsToInsert: T[] = extraIdField ? newRows.filter((row) => involvedRows.includes(row[primaryKey2])) : addedOrEditedRows;

    const insertQuery: Insert = squel.insert(squelConfig).into(tableName);

    if (primaryKey1) {
      if (Array.isArray(primaryKey1)) {
        this.addWhereConditionsToQuery(deleteQuery, newRows[0], primaryKey1);
      } else {
        deleteQuery.where('`' + primaryKey1 + '` = ' + newRows[0][primaryKey1]);
      }
    }
    deleteQuery.where('`' + primaryKey2 + '` IN ?', involvedRows);

    insertQuery.setFieldsRows(rowsToInsert);

    return this.getFinalDiffDeleteInsertQuery(rowsToInsert, deleteQuery, insertQuery);
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
    return updateQuery.toString() + ';';
  }

  // Generates the DELETE query of ONE row using more than 2 keys
  getDeleteMultipleKeysQuery<T extends TableRow>(
    tableName: string, // the name of the table (example: 'conditions')
    row: T, // the row, it MUST contain ALL the primaryKeys
    primaryKeys: string[], // array of the primary keys (example: ['SourceTypeOrReferenceId', 'SourceGroup', 'SourceEntry'])
  ) {
    const deleteQuery: Delete = squel.delete(squelConfig).from(tableName);
    this.addWhereConditionsToQuery(deleteQuery, row, primaryKeys);
    return deleteQuery.toString() + ';';
  }

  // Generates the full DELETE/INSERT query of ONE row using more than 2 keys
  getFullDeleteInsertMultipleKeysQuery<T extends TableRow>(
    tableName: string, // the name of the table (example: 'conditions')
    currentRow: T, // the original row, it MUST contain ALL the primaryKeys
    newRow: T, // the original row, it MUST contain ALL the primaryKeys
    primaryKeys: string[], // array of the primary keys
  ) {
    const insertQuery: Insert = squel.insert(squelConfig).into(tableName).setFieldsRows([newRow]);
    let query: string = this.getDeleteMultipleKeysQuery(tableName, currentRow, primaryKeys) + '\n';
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
      `SELECT name AS v FROM creature_template AS ct INNER JOIN creature AS c ON ct.entry = c.id WHERE c.guid = ${guid}`,
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

  /** Renders ids as a SQL `IN (...)` list. An empty list becomes `NULL`, which is valid SQL that matches nothing. */
  private toIdList(ids: number[]): string {
    const sanitised = ids.map((id) => Math.trunc(Number(id))).filter((id) => Number.isFinite(id));
    return sanitised.length > 0 ? sanitised.join(',') : 'NULL';
  }

  /**
   * One frontier expansion of a quest chain: every `quest_template_addon` row that is either one of `ids`, or is linked
   * to one of `ids` in any direction, or shares one of `exclusiveGroups`. One query per BFS level rather than per node.
   */
  getQuestChainRelations(ids: number[], exclusiveGroups: number[] = []): Promise<QuestChainRelationRow[]> {
    const idList = this.toIdList(ids);
    // PrevQuestID is negated when it means "enabled by", so match both signs to catch either kind of parent link.
    const prevList = this.toIdList([...ids, ...ids.map((id) => -id)]);
    const groupList = this.toIdList(exclusiveGroups);

    const conditions = [
      `ID IN (${idList})`,
      `PrevQuestID IN (${prevList})`,
      `NextQuestID IN (${idList})`,
      `BreadcrumbForQuestId IN (${idList})`,
    ];

    if (exclusiveGroups.length > 0) {
      conditions.push(`ExclusiveGroup IN (${groupList})`);
    }

    return this.queryToPromiseCached<QuestChainRelationRow>(
      'getQuestChainRelations',
      `${idList}|${groupList}`,
      `SELECT ID, PrevQuestID, NextQuestID, ExclusiveGroup, BreadcrumbForQuestId
       FROM quest_template_addon WHERE ${conditions.join(' OR ')}`,
    );
  }

  /**
   * One frontier expansion over quest prerequisites expressed as `conditions` instead of as
   * `quest_template_addon` columns. Matched in both directions, like the addon query, so the walk finds both what
   * gates a quest and what that quest gates.
   *
   * Restricted to the plainly "must have done quest X" types and to positive rows: a negated condition means the
   * opposite of a prerequisite, and drawing it as one would be worse than not drawing it at all.
   */
  getQuestConditionPrerequisites(ids: number[]): Promise<QuestConditionPrerequisiteRow[]> {
    const idList = this.toIdList(ids);

    return this.queryToPromiseCached<QuestConditionPrerequisiteRow>(
      'getQuestConditionPrerequisites',
      idList,
      `SELECT SourceEntry, ElseGroup, ConditionValue1 FROM conditions
       WHERE SourceTypeOrReferenceId = ${CONDITION_SOURCE_TYPES.SOURCE_TYPE_QUEST_AVAILABLE}
       AND ConditionTypeOrReference IN (${QUEST_PREREQUISITE_CONDITION_TYPES.join(',')})
       AND NegativeCondition = 0 AND ConditionValue1 > 0
       AND (SourceEntry IN (${idList}) OR ConditionValue1 IN (${idList}))`,
    );
  }

  /**
   * How many `SOURCE_TYPE_QUEST_AVAILABLE` (19) rows gate each of the given quests.
   * Quests absent from the result have no such conditions.
   */
  getQuestConditionCounts(ids: number[]): Promise<QuestConditionCountRow[]> {
    const idList = this.toIdList(ids);

    return this.queryToPromiseCached<QuestConditionCountRow>(
      'getQuestConditionCounts',
      idList,
      `SELECT SourceEntry, COUNT(*) AS conditionCount FROM conditions
       WHERE SourceTypeOrReferenceId = ${CONDITION_SOURCE_TYPES.SOURCE_TYPE_QUEST_AVAILABLE} AND SourceEntry IN (${idList}) GROUP BY SourceEntry`,
    );
  }

  /**
   * How many `SOURCE_TYPE_SMART_EVENT` (22) rows gate each event of one smart script.
   * Returned `SourceGroup` is the `smart_scripts.id` **plus one** — the core's own off-by-one, not a bug here.
   */
  getSmartEventConditionCounts(entryOrGuid: string | number, sourceType: string | number): Promise<SmartEventConditionCountRow[]> {
    const entry = Math.trunc(Number(entryOrGuid));
    const type = Math.trunc(Number(sourceType));

    return this.queryToPromiseCached<SmartEventConditionCountRow>(
      'getSmartEventConditionCounts',
      `${entry}:${type}`,
      `SELECT SourceGroup, COUNT(*) AS conditionCount FROM conditions
       WHERE SourceTypeOrReferenceId = ${CONDITION_SOURCE_TYPES.SOURCE_TYPE_SMART_EVENT} AND SourceEntry = ${entry} AND SourceId = ${type}
       GROUP BY SourceGroup`,
    );
  }

  /** Titles for the given quest ids. Ids missing from the result do not exist in `quest_template`. */
  getQuestTitlesByIds(ids: number[]): Promise<QuestTitleRow[]> {
    const idList = this.toIdList(ids);

    return this.queryToPromiseCached<QuestTitleRow>(
      'getQuestTitlesByIds',
      idList,
      `SELECT ID, LogTitle FROM quest_template WHERE ID IN (${idList})`,
    );
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

  /** Searches `broadcast_text` for `text`, matching either of the two gendered wordings. */
  getBroadcastTextSearchQuery(text: string, limit: number | undefined): string {
    // Bound as a parameter rather than interpolated: squel reads a bare `?` in a raw condition as a
    // placeholder, and the dialogue this searches is full of question marks.
    const like = `%${text}%`;
    const query = squel.select(squelConfig).from(BROADCAST_TEXT_TABLE).where('`MaleText` LIKE ? OR `FemaleText` LIKE ?', like, like);

    if (limit) {
      query.limit(Number(limit));
    }

    return query.toString();
  }

  /** Selects the `broadcast_text` rows lying within `range` ids of `id`, `id` itself included. */
  getBroadcastTextAdjacentQuery(id: number, range: number): string {
    return squel
      .select(squelConfig)
      .from(BROADCAST_TEXT_TABLE)
      .where(`\`ID\` BETWEEN ${id - range} AND ${id + range}`)
      .order('ID')
      .toString();
  }

  getCreatureDisplayIdById(creatureId: string | number): Promise<number> {
    return this.queryValueToPromiseCached(
      'getCreatureDisplayIdById',
      String(creatureId),
      `SELECT CreatureDisplayID AS v FROM creature_template_model WHERE CreatureID=${creatureId}`,
    );
  }

  getGameobjectDisplayIdById(gameObjectId: string | number): Promise<number> {
    return this.queryValueToPromiseCached(
      'getGameobjectDisplayIdById',
      String(gameObjectId),
      `SELECT displayId AS v FROM gameobject_template WHERE entry=${gameObjectId}`,
    );
  }

  getCreaturePosition(guid: string | number): Promise<{ mapId: number; x: number; y: number; orientation: number } | null> {
    return this.queryToPromiseCached<{ mapId: number; x: number; y: number; orientation: number }>(
      'getCreaturePosition',
      String(guid),
      `SELECT map AS mapId, position_x AS x, position_y AS y, orientation FROM creature WHERE guid = ${guid}`,
    ).then((result) => (result && result.length > 0 ? result[0] : null));
  }

  getCreaturePositionByEntry(
    entry: string | number,
  ): Promise<{ mapId: number; x: number; y: number; orientation: number; guid: number }[]> {
    return this.queryToPromiseCached<{ mapId: number; x: number; y: number; orientation: number; guid: number }>(
      'getCreaturePositionByEntry',
      String(entry),
      `SELECT map AS mapId, position_x AS x, position_y AS y, orientation, guid FROM creature WHERE id = ${entry} LIMIT 1`,
    );
  }

  getGameObjectPosition(guid: string | number): Promise<{ mapId: number; x: number; y: number; orientation: number } | null> {
    return this.queryToPromiseCached<{ mapId: number; x: number; y: number; orientation: number }>(
      'getGameObjectPosition',
      String(guid),
      `SELECT map AS mapId, position_x AS x, position_y AS y, rotation0 AS orientation FROM gameobject WHERE guid = ${guid}`,
    ).then((result) => (result && result.length > 0 ? result[0] : null));
  }

  getGameObjectPositionByEntry(
    entry: string | number,
  ): Promise<{ mapId: number; x: number; y: number; orientation: number; guid: number }[]> {
    return this.queryToPromiseCached<{ mapId: number; x: number; y: number; orientation: number; guid: number }>(
      'getGameObjectPositionByEntry',
      String(entry),
      `SELECT map AS mapId, position_x AS x, position_y AS y, rotation0 AS orientation, guid FROM gameobject WHERE id = ${entry} LIMIT 1`,
    );
  }

  getCreatureSpawnsByEntry(entry: string | number): Promise<{ mapId: number; x: number; y: number; orientation: number; guid: number }[]> {
    return this.queryToPromiseCached<{ mapId: number; x: number; y: number; orientation: number; guid: number }>(
      'getCreatureSpawnsByEntry',
      String(entry),
      `SELECT map AS mapId, position_x AS x, position_y AS y, orientation, guid FROM creature WHERE id = ${entry}`,
    );
  }

  getGameObjectSpawnsByEntry(
    entry: string | number,
  ): Promise<{ mapId: number; x: number; y: number; orientation: number; guid: number }[]> {
    return this.queryToPromiseCached<{ mapId: number; x: number; y: number; orientation: number; guid: number }>(
      'getGameObjectSpawnsByEntry',
      String(entry),
      `SELECT map AS mapId, position_x AS x, position_y AS y, rotation0 AS orientation, guid FROM gameobject WHERE id = ${entry}`,
    );
  }

  // Capped at 2 rows: callers only need to distinguish "exactly one dropper" from "more than one".
  getCreaturesDroppingItem(itemId: string | number): Promise<{ entry: number }[]> {
    return this.queryToPromiseCached<{ entry: number }>(
      'getCreaturesDroppingItem',
      String(itemId),
      `SELECT DISTINCT ct.entry AS entry FROM creature_template AS ct
       INNER JOIN creature_loot_template AS clt ON clt.Entry = ct.lootid
       WHERE ct.lootid > 0 AND clt.Item = ${itemId} LIMIT 2`,
    );
  }

  getGameObjectsDroppingItem(itemId: string | number): Promise<{ entry: number }[]> {
    return this.queryToPromiseCached<{ entry: number }>(
      'getGameObjectsDroppingItem',
      String(itemId),
      `SELECT DISTINCT gt.entry AS entry FROM gameobject_template AS gt
       INNER JOIN gameobject_loot_template AS glt ON glt.Entry = gt.Data1
       WHERE gt.Data1 > 0 AND glt.Item = ${itemId} LIMIT 2`,
    );
  }

  getQuestRelationEntries(table: string, questId: string | number): Promise<{ id: number }[]> {
    return this.queryToPromiseCached<{ id: number }>(
      'getQuestRelationEntries',
      `${table}:${questId}`,
      `SELECT id FROM ${table} WHERE quest = ${questId}`,
    );
  }

  getTables(): Observable<TableRow[]> {
    return this.query('SHOW TABLES');
  }

  getColumns(tableName: string): Observable<TableRow[]> {
    return this.query(`SHOW COLUMNS FROM \`${tableName}\``);
  }
}
