import { Injectable, inject } from '@angular/core';
import { TableRow } from '@keira/shared/constants';
import { ItemExtendedCost, Lock } from '@keira/shared/acore-world-model';
import { from, Observable, of, shareReplay, tap } from 'rxjs';
import { SqliteService } from '../sqlite.service';
import { BaseQueryService } from './base-query.service';
import { ConfigService } from '@keira/shared/common-services';

@Injectable({
  providedIn: 'root',
})
export class SqliteQueryService extends BaseQueryService {
  private readonly sqliteService = inject(SqliteService);
  private readonly configService = inject(ConfigService);

  private itemDisplayIdCache: Observable<string | null>[] = [];
  private spellDisplayIdCache: Observable<string | null>[] = [];

  /* istanbul ignore next */ // Note: will be tested in e2e
  query<T extends TableRow>(queryString: string, silent = false): Observable<T[]> {
    return this.sqliteService.dbQuery<T>(queryString).pipe(
      tap((val) => {
        if (this.configService.debugMode() && !silent) {
          console.log(`\n${queryString}`);
          console.log(val);
        }
      }),
    );
  }

  getIconByItemDisplayId(displayId: string | number): Observable<string | null> {
    displayId = Number(displayId);

    if (!this.itemDisplayIdCache[displayId]) {
      this.itemDisplayIdCache[displayId] = this.queryValue<string>(
        `SELECT icon AS v FROM display_icons WHERE displayId = ${displayId}`,
      ).pipe(shareReplay());
    }

    return this.itemDisplayIdCache[displayId];
  }

  getSpellNameById(spellId: string | number): Promise<string> {
    return this.queryValueToPromiseCached('getSpellNameById', String(spellId), `SELECT spellName AS v FROM spells WHERE id = ${spellId}`);
  }

  getIconBySpellDisplayId(displayId: string | number): Observable<string | null> {
    displayId = Number(displayId);

    if (!this.spellDisplayIdCache[displayId]) {
      this.spellDisplayIdCache[displayId] = this.queryValue<string>(`SELECT icon AS v FROM spells_icon WHERE ID = ${displayId}`).pipe(
        shareReplay(),
      );
    }

    return this.spellDisplayIdCache[displayId];
  }

  getDisplayIdBySpellId(id: string | number | undefined): Observable<string | number | undefined> {
    return !!id
      ? from(this.queryValueToPromiseCached('getDisplayIdBySpellId', String(id), `SELECT spellIconID AS v FROM spells WHERE ID = ${id}`))
      : of(undefined);
  }

  getSkillNameById(skillId: string | number): Promise<string> {
    return this.queryValueToPromiseCached<string>(
      'getSkillNameById',
      String(skillId),
      `SELECT name AS v FROM skills WHERE id = ${skillId}`,
    );
  }

  getFactionNameById(id: string | number): Promise<string> {
    return this.queryValueToPromiseCached<string>(
      'getFactionNameById',
      String(id),
      `SELECT m_name_lang_1 AS v FROM factions WHERE m_ID = ${id}`,
    );
  }

  getFactionNameByNameId(id: string | number): Promise<string> {
    return this.queryValueToPromiseCached<string>(
      'getFactionNameByNameId',
      String(id),
      `SELECT m_name_lang_1 AS v FROM factions WHERE faction_name_id = ${id}`,
    );
  }

  getMapNameById(id: string | number): Promise<string> {
    return this.queryValueToPromiseCached<string>('getMapNameById', String(id), `SELECT m_MapName_lang1 AS v FROM maps WHERE m_ID = ${id}`);
  }

  getAreaNameById(id: string | number): Promise<string> {
    return this.queryValueToPromiseCached<string>(
      'getAreaNameById',
      String(id),
      `SELECT m_AreaName_lang AS v FROM areas_and_zones WHERE m_ID = ${id}`,
    );
  }

  getEventNameByHolidayId(id: string | number): Promise<string> {
    return this.queryValueToPromiseCached<string>('getEventNameByHolidayId', String(id), `SELECT name AS v FROM holiday WHERE id = ${id}`);
  }

  getSocketBonusById(id: string | number): Promise<string> {
    return this.queryValueToPromiseCached<string>(
      'getSocketBonusById',
      String(id),
      `SELECT name AS v FROM item_enchantment WHERE id = ${id}`,
    );
  }

  getSpellDescriptionById(spellId: string | number): Promise<string> {
    return this.queryValueToPromiseCached<string>(
      'getSpellDescriptionById',
      String(spellId),
      `SELECT Description AS v FROM spells WHERE id = ${spellId}`,
    );
  }

  getLockById(id: string | number): Promise<Lock[]> {
    return this.queryToPromiseCached<Lock>('getLockById', String(id), `SELECT * FROM lock WHERE id = ${id}`);
  }

  getRewardXP(RewardXPDifficulty: string | number, QuestLevel: string | number): Promise<string> {
    return this.queryValueToPromiseCached<string>(
      'getRewardXP',
      String(RewardXPDifficulty) + '_' + String(QuestLevel),
      `SELECT field${Number(RewardXPDifficulty) + 1} AS v FROM questxp WHERE id = ${QuestLevel}`,
    );
  }

  getItemExtendedCost(IDs: number[]): Promise<ItemExtendedCost[]> {
    return this.queryToPromiseCached<ItemExtendedCost>(
      'getItemExtendedCost',
      String(IDs.join(',')),
      `SELECT * FROM item_extended_cost WHERE id IN (${IDs.join(',')})`,
    );
  }
}
