// TODO: this file is poorly implemented and needs heavy refactoring to clean the code
//  - functions should be broken down into smaller ones, with self-describing names
//  - comments should be added to document what the code is actually doing
//  - type errors should be fixed and any usage of "@ts-ignore" or "any" should be removed

import { Injectable } from '@angular/core';
import {
  FACTION_RANK,
  ITEM_FLAG,
  ITEM_MOD,
  ITEM_TYPE,
  ItemExtendedCost,
  ITEMS_QUALITY,
  ItemTemplate,
  PVP_RANK,
} from '@keira/shared/acore-world-model';
import { CLASSES_TEXT, RACES_TEXT } from '@keira/shared/constants';
import { MysqlQueryService, SqliteQueryService } from '@keira/shared/db-layer';
import { ITEM_CONSTANTS } from './item-constants';
import { gtCombatRatings, lvlIndepRating, MAX_LEVEL, resistanceFields } from './item-preview';
import { PreviewHelperService } from '@keira/shared/preview';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ItemPreviewService {
  private readonly ITEM_CONSTANTS = ITEM_CONSTANTS;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    private readonly sqliteQueryService: SqliteQueryService,
    private readonly mysqlQueryService: MysqlQueryService,
    private readonly helperService: PreviewHelperService,
  ) {}

  /**
   * query functions
   */

  private getItemsetSlotBak(itemset: number | string): Promise<any[]> {
    return lastValueFrom(this.sqliteQueryService.query(`SELECT * FROM items WHERE itemset = ${itemset} ORDER BY slotBak, id`));
  }

  private getItemNameByIDsASC(IDs: number[]): Promise<any[]> {
    return lastValueFrom(
      this.mysqlQueryService.query(`SELECT name FROM item_template WHERE entry IN (${IDs.join(',')}) ORDER BY entry ASC`),
    );
  }

  private getItemsetById(ID: number | string): Promise<any> {
    return lastValueFrom(this.sqliteQueryService.query(`SELECT * FROM itemset WHERE id = ${ID}`));
  }

  private getItemLimitCategoryById(id: number | string): Promise<any[]> {
    return lastValueFrom(this.sqliteQueryService.query(`SELECT * FROM item_limit_category WHERE id = ${id}`));
  }

  private getGemEnchantmentIdById(id: number | string): Promise<string | number> {
    return lastValueFrom(this.sqliteQueryService.queryValue(`SELECT gemEnchantmentId AS v FROM items WHERE id = ${id};`)) as Promise<
      string | number
    >;
  }

  private getItemEnchantmentById(id: number | string): Promise<any[]> {
    return lastValueFrom(this.sqliteQueryService.query(`SELECT * FROM item_enchantment WHERE id = ${id}`));
  }

  private getItemExtendedCost(IDs: number[]): Promise<ItemExtendedCost[]> {
    return lastValueFrom(
      this.sqliteQueryService.query<ItemExtendedCost>(`SELECT * FROM item_extended_cost WHERE id IN (${IDs.join(',')})`),
    );
  }

  private getItemEnchantmentConditionById(id: number | string): Promise<any[]> {
    return lastValueFrom(this.sqliteQueryService.query(`SELECT * FROM item_enchantment_condition WHERE id = ${id}`));
  }

  private getItemExtendedCostFromVendor(itemId: number | string): Promise<any[]> {
    return lastValueFrom(
      this.mysqlQueryService.query(
        `SELECT
      nv.item,
      nv.entry,
      0 AS eventId,
      nv.maxcount,
      nv.extendedCost
    FROM
      npc_vendor nv
    WHERE
      nv.item = ${itemId}
    UNION SELECT
      genv.item,
      c.id1 AS \`entry\`,
      ge.eventEntry AS eventId,
      genv.maxcount,
      genv.extendedCost
    FROM
      game_event_npc_vendor genv
          LEFT JOIN
      game_event ge ON genv.eventEntry = ge.eventEntry
          JOIN
      creature c ON c.guid = genv.guid
    WHERE
      genv.item = ${itemId};`,
      ),
    );
  }

  /**
   * utils
   */

  private setRatingLevel(level: number, type: number, val: number): string {
    let result = '';
    const rating = [
      ITEM_MOD.DEFENSE_SKILL_RATING,
      ITEM_MOD.DODGE_RATING,
      ITEM_MOD.PARRY_RATING,
      ITEM_MOD.BLOCK_RATING,
      ITEM_MOD.RESILIENCE_RATING,
    ];

    if (rating.includes(type) && level < 34) {
      level = 34;
    }

    // @ts-ignore // TODO: fix typing and remove @ts-ignore
    const gtCombatRating = gtCombatRatings[type];

    if (gtCombatRating) {
      let c: number;
      if (level > 70) {
        c = (82 / 52) * Math.pow(131 / 63, (level - 70) / 10);
      } else if (level > 60) {
        c = 82 / (262 - 3 * level);
      } else if (level > 10) {
        c = (level - 8) / 52;
      } else {
        c = 2 / 52;
      }
      // do not use localized number format here!
      result = (val / gtCombatRating / c).toFixed(2);
    }

    if (![ITEM_MOD.DEFENSE_SKILL_RATING, ITEM_MOD.EXPERTISE_RATING].includes(type)) {
      result += '%';
    }

    return ITEM_CONSTANTS.ratingString.replace('%s', `<!--rtg%${type}-->${result}`).replace('%s', `<!--lvl-->${level}`);
  }

  private parseRating(type: number, value: number, requiredLevel: number): string {
    // clamp level range
    const level = requiredLevel > 1 ? requiredLevel : MAX_LEVEL;

    // unknown rating
    if ([2, 8, 9, 10, 11].includes(type) || type > ITEM_MOD.BLOCK_VALUE || type < 0 || !ITEM_CONSTANTS.statType[type]) {
      return '';
    }

    if (lvlIndepRating.includes(type)) {
      // level independent Bonus
      return ITEM_CONSTANTS.trigger[1] + ITEM_CONSTANTS.statType[type]?.replace('%d', `<!--rtg${type}-->${value}`);
    }

    // rating-Bonuses
    const js = `&nbsp;<small>(${this.setRatingLevel(level, type, value)})</small>`;
    return ITEM_CONSTANTS.trigger[1] + ITEM_CONSTANTS.statType[type]?.replace('%d', `<!--rtg${type}-->${value}${js}`);
  }

  private parseTime(sec: number) {
    const time = {
      d: 0,
      h: 0,
      m: 0,
      s: 0,
      ms: 0,
    };

    if (sec >= 3600 * 24) {
      time['d'] = Math.floor(sec / 3600 / 24);
      sec -= time['d'] * 3600 * 24;
    }

    if (sec >= 3600) {
      time.h = Math.floor(sec / 3600);
      sec -= time['h'] * 3600;
    }

    if (sec >= 60) {
      time.m = Math.floor(sec / 60);
      sec -= time.m * 60;
    }

    if (sec >= 1) {
      time['s'] = sec;
      sec -= time['s'];
    }

    if ((sec * 1000) % 1000) {
      time.ms = sec * 1000;
    }

    return time;
  }

  private formatTime(base: number) {
    const s = this.parseTime(base / 1000);
    const tmp = s.d + s.h / 24;

    if (tmp > 1 && !(tmp % 364)) {
      // whole years
      return Math.round((s.d + s.h / 24) / 364) + ' ' + ITEM_CONSTANTS.timeUnits[Math.abs(s.d / 364) === 1 && !s.h ? 'sg' : 'pl'][0];
    }
    if (tmp > 1 && !(tmp % 30)) {
      // whole month
      return Math.round((s.d + s.h / 24) / 30) + ' ' + ITEM_CONSTANTS.timeUnits[Math.abs(s.d / 30) === 1 && !s.h ? 'sg' : 'pl'][1];
    }
    if (tmp > 1 && !(tmp % 7)) {
      // whole weeks
      return Math.round((s.d + s.h / 24) / 7) + ' ' + ITEM_CONSTANTS.timeUnits[Math.abs(s.d / 7) === 1 && !s.h ? 'sg' : 'pl'][2];
    }
    if (s.d !== 0) {
      return Math.round(s.d + s.h / 24) + ' ' + ITEM_CONSTANTS.timeUnits[Math.abs(s.d) === 1 && !s.h ? 'sg' : 'pl'][3];
    }
    if (s.h !== 0) {
      return Math.round(s.h + s.m / 60) + ' ' + ITEM_CONSTANTS.timeUnits[Math.abs(s.h) === 1 && !s.m ? 'sg' : 'pl'][4];
    }
    if (s.m !== 0) {
      return Math.round(s.m + s.s / 60) + ' ' + ITEM_CONSTANTS.timeUnits[Math.abs(s.m) === 1 && !s.s ? 'sg' : 'pl'][5];
    }
    if (s.s !== 0) {
      return Math.round(s.s + s.ms / 1000) + ' ' + ITEM_CONSTANTS.timeUnits[Math.abs(s.s) === 1 && !s.ms ? 'sg' : 'pl'][6];
    }
    if (s.ms !== 0) {
      return s.ms + ' ' + ITEM_CONSTANTS.timeUnits[Math.abs(s.ms) === 1 ? 'sg' : 'pl'][7];
    }

    return '0 ' + ITEM_CONSTANTS.timeUnits.pl[6];
  }

  private getFeralAP(itemClass: number, subclass: number, dps: number): number {
    // must be weapon
    if (itemClass !== ITEM_TYPE.WEAPON) {
      return 0;
    }

    // must be 2H weapon (2H-Mace, Polearm, Staff, ..Fishing Pole)
    if (![5, 6, 10, 20].includes(subclass)) {
      return 0;
    }

    // must have enough damage
    if (dps < 54.8) {
      return 0;
    }

    return Math.round((dps - 54.8) * 14);
  }

  private canTeachSpell(spellId1: number, spellId2: number | null = null): boolean {
    // 483:   learn recipe;
    // 55884: learn mount/pet
    if (![483, 55884].includes(spellId1)) {
      return false;
    }

    // needs learnable spell
    return !!spellId2;
  }

  private async getLocks(lockId: number): Promise<string[]> {
    /* istanbul ignore next */
    if (!lockId) {
      return [''];
    }

    const lock = (await this.sqliteQueryService.getLockById(lockId))[0];

    if (!lock) {
      return [];
    }

    const locks = [];

    for (let i = 1; i <= 5; i++) {
      const prop = lock['properties' + i];
      const rank = lock['reqSkill' + i];
      let name = '';

      const lockType = Number(lock['type' + i]);

      if (lockType === 1) {
        // opened by item
        name = await this.mysqlQueryService.getItemNameById(prop);

        if (!name) {
          continue;
        }
      } else if (lockType === 2) {
        // opened by skill

        // @ts-ignore // TODO: fix typing and remove @ts-ignore
        const lockType = ITEM_CONSTANTS.lockType[prop];

        // exclude unusual stuff
        if (!lockType || ![1, 2, 3, 4, 9, 16, 20].includes(Number(prop))) {
          continue;
        }

        name = lockType;

        if (+rank > 0) {
          name += ` (${rank})`;
        }
      } else {
        continue;
      }

      locks.push(`<br>Requires ${name}`);
    }

    return locks;
  }

  // todo (med): information will get lost if one vendor sells one item multiple times with different costs (e.g. for item 54637)
  //             wowhead seems to have had the same issues
  private async getExtendedCost(entry: number, flagsExtra: number, buyPrice: number): Promise<any[]> {
    if (!entry) {
      return [];
    }

    const itemz = {};
    let xCostData = [];
    const xCostDataArr = {};
    const rawEntries = await this.getItemExtendedCostFromVendor(entry);

    if (!rawEntries) {
      return [];
    }

    for (const costEntry of rawEntries) {
      /* istanbul ignore else */
      if (costEntry.extendedCost) {
        xCostData.push(costEntry.extendedCost);
      }

      /* istanbul ignore next */
      // @ts-ignore // TODO: fix typing and remove @ts-ignore
      if (itemz[costEntry.item] && itemz[costEntry.item][costEntry.entry]) {
        // @ts-ignore // TODO: fix typing and remove @ts-ignore
        itemz[costEntry.item][costEntry.entry] = [costEntry];
      } else {
        // @ts-ignore // TODO: fix typing and remove @ts-ignore
        itemz[costEntry.item] = {};
        // @ts-ignore // TODO: fix typing and remove @ts-ignore
        itemz[costEntry.item][costEntry.entry] = [];
        // @ts-ignore // TODO: fix typing and remove @ts-ignore
        itemz[costEntry.item][costEntry.entry].push(costEntry);
      }
    }

    if (
      /* istanbul ignore next */
      !!xCostData &&
      xCostData.length > 0
    ) {
      xCostData = Array.from(new Set(xCostData)); // filter duplicates
      xCostData = await this.getItemExtendedCost(xCostData);

      /* istanbul ignore else */
      if (!!xCostData && xCostData.length > 0) {
        // converting xCostData to ARRAY_KEY structure
        for (const xCost of xCostData) {
          // @ts-ignore // TODO: fix typing and remove @ts-ignore
          xCostDataArr[xCost.id] = xCost;
        }
      } else {
        /* istanbul ignore next */
        return [];
      }
    }

    const cItems = [];

    for (const [k, vendors] of Object.entries(itemz)) {
      // @ts-ignore // TODO: fix typing and remove @ts-ignore
      for (const [l, vendor] of Object.entries(vendors)) {
        // @ts-ignore // TODO: fix typing and remove @ts-ignore
        for (const [m, vInfo] of Object.entries(vendor)) {
          let costs = [];
          /* istanbul ignore else */
          // @ts-ignore // TODO: fix typing and remove @ts-ignore
          if (xCostDataArr[vInfo['extendedCost']] && Object.keys(xCostDataArr[vInfo['extendedCost']]).length > 0) {
            // @ts-ignore // TODO: fix typing and remove @ts-ignore
            costs = xCostDataArr[vInfo['extendedCost']];
          }

          const data = {
            stock:
              // @ts-ignore // TODO: fix typing and remove @ts-ignore
              vInfo['maxcount'] ??
              /* istanbul ignore next */
              -1,
            // @ts-ignore // TODO: fix typing and remove @ts-ignore
            event: vInfo['eventId'],
            reqRating: costs ? costs['reqPersonalRating'] : /* istanbul ignore next */ 0,
            /* istanbul ignore next */
            reqBracket: costs ? costs['reqArenaSlot'] : /* istanbul ignore next */ 0,
          };

          // hardcode arena(103) & honor(104)
          if (costs['reqArenaPoints'] > 0) {
            // @ts-ignore // TODO: fix typing and remove @ts-ignore
            data[-103] = costs['reqArenaPoints'];
          }

          if (costs['reqHonorPoints'] > 0) {
            // @ts-ignore // TODO: fix typing and remove @ts-ignore
            data[-104] = costs['reqHonorPoints'];
          }

          for (let i = 1; i < 6; i++) {
            if (costs['reqItemId' + i] /* && costs['reqItemId' + i].length > 0 */ && costs['itemCount' + i] && costs['itemCount' + i] > 0) {
              // @ts-ignore // TODO: fix typing and remove @ts-ignore
              data[costs['reqItemId' + i]] = costs['itemCount' + i];
              cItems.push(costs['reqItemId' + i]);
            }
          }

          // no extended cost or additional gold required
          if (!costs || flagsExtra & 0x04) {
            if (!!buyPrice) {
              // @ts-ignore // TODO: fix typing and remove @ts-ignore
              data[0] = buyPrice;
            }
          }

          // @ts-ignore // TODO: fix typing and remove @ts-ignore
          vendor[m] = data;
        }
        // @ts-ignore // TODO: fix typing and remove @ts-ignore
        vendors[l] = vendor;
      }

      // @ts-ignore // TODO: fix typing and remove @ts-ignore
      itemz[k] = vendors;
    }

    // convert items to currency if possible
    /* istanbul ignore else */
    if (!!cItems) {
      for (const [itemId, vendors] of Object.entries(itemz)) {
        // @ts-ignore // TODO: fix typing and remove @ts-ignore
        for (const [npcId, costData] of Object.entries(vendors)) {
          // @ts-ignore // TODO: fix typing and remove @ts-ignore
          for (const [itr, cost] of Object.entries(costData)) {
            // @ts-ignore // TODO: fix typing and remove @ts-ignore
            for (const [k, v] of Object.entries(cost)) {
              if (cItems.includes(Number(k))) {
                for (const item of cItems) {
                  if (item === Number(k)) {
                    // @ts-ignore // TODO: fix typing and remove @ts-ignore
                    delete cost[Number(k)];
                    // @ts-ignore // TODO: fix typing and remove @ts-ignore
                    cost[-item.id] = v;

                    break;
                  }
                }
              }
            }
            // @ts-ignore // TODO: fix typing and remove @ts-ignore
            costData[itr] = cost;
          }
          // @ts-ignore // TODO: fix typing and remove @ts-ignore
          vendors[npcId] = costData;
        }
        // @ts-ignore // TODO: fix typing and remove @ts-ignore
        itemz[itemId] = vendors;
      }
    }

    const result = itemz;

    // @ts-ignore // TODO: fix typing and remove @ts-ignore
    let reqRating = [];
    for (const [itemId, data] of Object.entries(result)) {
      reqRating = [];
      // @ts-ignore // TODO: fix typing and remove @ts-ignore
      for (const [npcId, entries] of Object.entries(data)) {
        // @ts-ignore // TODO: fix typing and remove @ts-ignore
        for (const costs of entries) {
          // reqRating isn't really a cost .. so pass it by ref instead of return
          // use highest total value
          if (
            // @ts-ignore // TODO: fix typing and remove @ts-ignore
            data[npcId] &&
            costs['reqRating'] &&
            /* istanbul ignore next */
            // @ts-ignore // TODO: fix typing and remove @ts-ignore
            (reqRating.length === 0 || (reqRating && reqRating[0] < costs['reqRating']))
          ) {
            reqRating = [costs['reqRating'], costs['reqBracket']];
          }
        }
      }

      /* istanbul ignore next */
      if (!data) {
        // @ts-ignore // TODO: fix typing and remove @ts-ignore
        delete result[itemId];
      }
    }

    // @ts-ignore // TODO: fix typing and remove @ts-ignore
    return [result, reqRating];
  }

  /**
   * get item preview text
   */

  private getDamageText(itemTemplate: ItemTemplate): string {
    // Weapon/Ammunition Stats (not limited to weapons (see item:1700))
    const itemClass: number = Number(itemTemplate.class);
    const subclass: number = Number(itemTemplate.subclass);
    const dmgmin1: number = Number(itemTemplate.dmg_min1);
    const dmgmin2: number = Number(itemTemplate.dmg_min2);
    const dmgmax1: number = Number(itemTemplate.dmg_max1);
    const dmgmax2: number = Number(itemTemplate.dmg_max2);
    const speed = itemTemplate.delay / 1000;
    const sc1 = itemTemplate.dmg_type1;
    const sc2 = itemTemplate.dmg_type2;
    const dmgmin = dmgmin1 + dmgmin2;
    const dmgmax = dmgmax1 + dmgmax2;
    const dps = speed ? (dmgmin + dmgmax) / (2 * speed) : 0;

    let damageText = '';
    let dmg = '';

    if (itemClass === ITEM_TYPE.AMMUNITION && dmgmin && dmgmax) {
      if (sc1 && sc1 < ITEM_CONSTANTS.sc.length && sc1 > 0) {
        damageText += ITEM_CONSTANTS.damage.ammo[1].replace('%d', ((dmgmin + dmgmax) / 2).toString()).replace('%s', ITEM_CONSTANTS.sc[sc1]);
      } else {
        damageText += ITEM_CONSTANTS.damage.ammo[0].replace('%d', ((dmgmin + dmgmax) / 2).toString());
      }
    } else if (dps) {
      if (dmgmin1 === dmgmax1) {
        dmg = ITEM_CONSTANTS.damage.single[sc1 ? 1 : 0]
          .replace('%d', String(dmgmin1))
          .replace('%s', !!sc1 && sc1 < ITEM_CONSTANTS.sc.length && sc1 > 0 ? ITEM_CONSTANTS.sc[sc1] : '');
      } else {
        dmg = ITEM_CONSTANTS.damage.range[sc1 ? 1 : 0]
          .replace('%d', String(dmgmin1))
          .replace('%d', String(dmgmax1))
          .replace('%s', !!sc1 && sc1 < ITEM_CONSTANTS.sc.length && sc1 > 0 ? ITEM_CONSTANTS.sc[sc1] : '');
      }

      if (itemClass === ITEM_TYPE.WEAPON) {
        damageText += `<!--dmg--><table style="float: left; width: 100%;"><tr><td>${dmg}</td><td>&nbsp;&nbsp;&nbsp;&nbsp;</td><th style="text-align: right;">Speed <!--spd-->${speed.toFixed(
          2,
        )}</th></tr></table>`;
      } else {
        damageText += `<br><!--dmg-->${dmg}`;
      }

      // secondary damage is set
      /* istanbul ignore next */
      if ((dmgmin2 || dmgmax2) && dmgmin2 !== dmgmax2) {
        damageText += ITEM_CONSTANTS.damage.range[sc2 ? 3 : 2]
          .replace('%d', String(dmgmin2))
          .replace('%d', String(dmgmax2))
          .replace('%s', !!sc2 && sc2 < ITEM_CONSTANTS.sc.length && sc2 > 0 ? ITEM_CONSTANTS.sc[sc2] : '');
      } else if (dmgmin2) {
        damageText += ITEM_CONSTANTS.damage.single[sc2 ? 3 : 2]
          .replace('%d', String(dmgmin2))
          .replace('%s', !!sc2 && sc2 < ITEM_CONSTANTS.sc.length && sc2 > 0 ? ITEM_CONSTANTS.sc[sc2] : '');
      }

      if (itemClass === ITEM_TYPE.WEAPON) {
        damageText += `<br><!--dps-->${ITEM_CONSTANTS.dps.replace('%.1f', dps.toFixed(2))}`;
      }

      // display FeralAttackPower if set
      const fap = this.getFeralAP(itemClass, subclass, dps);
      if (fap) {
        damageText += `<br><span class="c11"><!--fap-->(${fap} ${ITEM_CONSTANTS.fap})</span>`;
      }
    }

    return damageText;
  }

  private getStats(itemTemplate: ItemTemplate, greenText: string[]): string {
    let stats = '';

    const requiredLevel = Number(itemTemplate.RequiredLevel);

    for (let i = 1; i <= 10; i++) {
      const type = Number(itemTemplate['stat_type' + i]);
      const qty = Number(itemTemplate['stat_value' + i]);

      if (!qty || (!type && type !== 0) || type < 0) {
        continue;
      }

      // base stat
      switch (type) {
        case ITEM_MOD.MANA:
        case ITEM_MOD.HEALTH:
        // type += 1;  // offsets may be required somewhere
        case ITEM_MOD.AGILITY:
        case ITEM_MOD.STRENGTH:
        case ITEM_MOD.INTELLECT:
        case ITEM_MOD.SPIRIT:
        case ITEM_MOD.STAMINA:
          stats += `<br><span><!--stat${type}-->${(qty > 0 ? '+' : '-') + Math.abs(qty)} ${ITEM_CONSTANTS.statType[type]}</span>`;
          break;
        default:
          // rating with % for reqLevel
          greenText.push(this.parseRating(type, qty, requiredLevel));
      }
    }

    return stats;
  }

  private async getItemSet(entry: number, itemset: number): Promise<string> {
    if (!itemset) {
      return '';
    }

    let itemsetText = '';

    const itemsetPieces = await this.getItemsetSlotBak(itemset);

    if (!itemsetPieces || itemsetPieces.length === 0) {
      return '';
    }

    // check if there are multiple itemset with the same itemset ID
    let multipleItemset = false;

    if (itemsetPieces && itemsetPieces.length > 10) {
      multipleItemset = true;
    } else {
      // TODO: fix typing
      const slotBak: any[] = [];
      for (const p of itemsetPieces) {
        if (slotBak.includes(p.slotBak)) {
          multipleItemset = true;
          break;
        } else {
          slotBak.push(p.slotBak);
        }
      }
    }

    // get pieces IDs
    const piecesIDs = [];

    if (multipleItemset) {
      // detect position of current item
      let position = 0;
      let currentSlotBak = itemsetPieces[0].slotBak;
      for (let i = 0; i < itemsetPieces.length; i++) {
        if (currentSlotBak !== itemsetPieces[i].slotBak) {
          currentSlotBak = itemsetPieces[i].slotBak;
          position = 0;
        }

        position++;
        if (itemsetPieces[i].id === entry) {
          break;
        }
      }

      // get itemsetPieces IDs
      let pos = 0;
      for (const p of itemsetPieces) {
        if (p.slotBak !== currentSlotBak) {
          currentSlotBak = p.slotBak;
          pos = 0;
        }

        pos++;

        /* istanbul ignore else */
        if (pos === position) {
          piecesIDs.push(p.id);
        }
      }
    } else {
      for (const p of itemsetPieces) {
        piecesIDs.push(p.id);
      }
    }

    piecesIDs.sort();

    // get items name
    const itemsName: any[] = await this.getItemNameByIDsASC(piecesIDs);

    if (!itemsName || (itemsName && itemsName.length === 0)) {
      return '';
    }

    for (let i = 0; i < itemsName.length; i++) {
      itemsName[i] = itemsName[i].name ?? '';
    }

    let itemsetAttr = await this.getItemsetById(itemset);

    if (!itemsetAttr || itemsName.join('') === '' || !itemsetAttr[0]) {
      return '';
    } else {
      itemsetAttr = itemsetAttr[0];
    }

    itemsetText +=
      '<br><br><span class="q">' +
      ITEM_CONSTANTS.setName
        .replace('%s', `${itemsetAttr['name'] ?? ''}`)
        .replace('%d', '0')
        .replace('%d', itemsName.length.toString()) +
      '</span>';

    // if require skill
    if (!!itemsetAttr['skillId']) {
      itemsetText += `<br>Requires ${await this.sqliteQueryService.getSkillNameById(itemsetAttr['skillId'])}`;

      if (!!itemsetAttr['skillLevel']) {
        itemsetText += ` (${itemsetAttr['skillLevel']})`;
      }
    }

    // list pieces
    itemsetText += `<br><div class="q0" style="padding-left: .6em">${itemsName.join('<br>')}</div>`;

    // get bonuses
    const setSpellsAndIdx = [];

    for (let j = 1; j <= 8; j++) {
      const spell = itemsetAttr['spell' + j];

      if (!!spell) {
        setSpellsAndIdx[spell] = j;
      }
    }

    const setSpells = [];
    if (setSpellsAndIdx && setSpellsAndIdx.length > 0) {
      const spellsIDs = Object.keys(setSpellsAndIdx);
      for (const s of spellsIDs) {
        setSpells.push({
          tooltip: await this.sqliteQueryService.getSpellDescriptionById(s),
          // @ts-ignore // TODO: fix typing and remove @ts-ignore
          entry: itemsetAttr['spell' + setSpellsAndIdx[s]],
          // @ts-ignore // TODO: fix typing and remove @ts-ignore
          bonus: itemsetAttr['bonus' + setSpellsAndIdx[s]],
        });
      }
    }

    // sort and list bonuses
    let tmpBonus = '';
    for (let i = 0; i < setSpells.length; i++) {
      for (let j = i; j < setSpells.length; j++) {
        if (setSpells[j]['bonus'] >= setSpells[i]['bonus']) {
          continue;
        }

        // TODO: fix typing
        const tmp: any = setSpells[i];
        setSpells[i] = setSpells[j];
        setSpells[j] = tmp;
      }

      const bonusText =
        setSpells[i]['bonus'] && setSpells[i]['tooltip']
          ? ITEM_CONSTANTS.setBonus.replace('%d', setSpells[i]['bonus']).replace('%s', setSpells[i]['tooltip'])
          : '';

      if (!!bonusText) {
        tmpBonus += `<br><span>${bonusText}</span>`;
      }
    }

    if (tmpBonus !== '') {
      itemsetText += `<span class="q0">${tmpBonus}</span>`;
    }

    return itemsetText;
  }

  private async getBonding(itemTemplate: ItemTemplate): Promise<string> {
    let bondingText = '';

    const flags = itemTemplate.Flags;
    const bonding: number = Number(itemTemplate.bonding);
    const maxcount: number = Number(itemTemplate.maxcount);
    const bagFamily: number = Number(itemTemplate.BagFamily);
    const itemLimitCategory = itemTemplate.ItemLimitCategory;

    // bonding
    if (flags & ITEM_FLAG.ACCOUNTBOUND && !!this.ITEM_CONSTANTS.bonding[0]) {
      bondingText += '<br><!-- bonding[0] -->' + this.ITEM_CONSTANTS.bonding[0];
    } else if (bonding && !!this.ITEM_CONSTANTS.bonding[bonding]) {
      bondingText += '<br><!-- [bonding] -->' + this.ITEM_CONSTANTS.bonding[bonding];
    }

    // unique || unique-equipped || unique-limited
    if (maxcount === 1) {
      bondingText += '<br><!-- unique[0] -->' + this.ITEM_CONSTANTS['unique'][0];
    } else if (!!maxcount && bagFamily !== 8192) {
      // not for currency tokens
      bondingText += '<br><!-- unique[1] -->' + this.ITEM_CONSTANTS['unique'][1].replace('%d', maxcount.toString());
    } else if (flags & ITEM_FLAG.UNIQUEEQUIPPED) {
      bondingText += '<br><!-- uniqueEquipped -->' + this.ITEM_CONSTANTS['uniqueEquipped'][0];
    } else if (!!itemLimitCategory) {
      let limit: any = await this.getItemLimitCategoryById(itemLimitCategory);

      if (limit && limit.length > 0) {
        limit = limit[0];

        const index = limit && limit.isGem ? 'uniqueEquipped' : 'unique';
        bondingText += `<br><!-- unique isGem -->${ITEM_CONSTANTS[index][2]?.replace('%s', limit.name).replace('%d', limit.count)}`;
      }
    }

    return bondingText;
  }

  private getClassText(inventoryType: number, itemClass: number, subclass: number): string {
    let classText = '';

    let textRight = '';
    if ([ITEM_TYPE.ARMOR, ITEM_TYPE.WEAPON, ITEM_TYPE.AMMUNITION].includes(itemClass)) {
      let classTmpText = '<table style="float: left; width: 100%;"><tr>';

      // Class
      if (inventoryType && !!ITEM_CONSTANTS.inventoryType[inventoryType]) {
        classTmpText += `<td>${ITEM_CONSTANTS.inventoryType[inventoryType]}</td>`;
        textRight = ' style="text-align: right;"';
      }

      // Subclass
      /* istanbul ignore else */
      if (itemClass === ITEM_TYPE.ARMOR && subclass > 0) {
        classTmpText += `<th${textRight}><!--asc ${subclass} -->${ITEM_CONSTANTS.armorSubClass[subclass]}</th>`;
      } else if (itemClass === ITEM_TYPE.WEAPON) {
        classTmpText += ITEM_CONSTANTS.weaponSubClass[subclass] ? `<th${textRight}>${ITEM_CONSTANTS.weaponSubClass[subclass]}</th>` : '';
      } else if (itemClass === ITEM_TYPE.AMMUNITION) {
        classTmpText += ITEM_CONSTANTS.projectileSubClass[subclass]
          ? `<th${textRight}>${ITEM_CONSTANTS.projectileSubClass[subclass]}</th>`
          : '';
      }

      classTmpText += '</tr></table>';

      if (classTmpText !== '<table style="float: left; width: 100%;"><tr></tr></table>') {
        classText += classTmpText;
      }

      // inventoryType/slot can occur on random items and is then also displayed <_< .. excluding Bags >_>
    } else if (inventoryType && itemClass !== ITEM_TYPE.CONTAINER && !!ITEM_CONSTANTS.inventoryType[subclass]) {
      classText += `<br><!-- InventoryType -->${ITEM_CONSTANTS.inventoryType[subclass]}`;
    }

    return classText;
  }

  private getArmorText(itemTemplate: ItemTemplate): string {
    let armorText = '';

    // Armor
    const armorDamageModifier = itemTemplate.ArmorDamageModifier;
    const armor = itemTemplate.armor;
    const itemClass: number = Number(itemTemplate.class);
    if (itemClass === ITEM_TYPE.ARMOR && armorDamageModifier > 0 && !!armor) {
      armorText += `<br><span class="q2"><!--addamr${armorDamageModifier}--><span>${ITEM_CONSTANTS.armor.replace(
        '%s',
        String(armor),
      )}</span></span>`;
    } else if (armor) {
      armorText += `<br><span><!--amr-->${ITEM_CONSTANTS.armor.replace('%s', String(armor))}</span>`;
    }

    // Block (note: block value from field block and from field stats or parsed from itemSpells are displayed independently)
    const block = itemTemplate.block;
    if (block) {
      armorText += `<br><span>${ITEM_CONSTANTS.block.replace('%s', String(block))}</span>`;
    }

    return armorText;
  }

  private async getRequiredText(itemTemplate: ItemTemplate): Promise<string> {
    let requiredText = '';

    // required classes
    const classes = this.helperService.getRequiredClass(itemTemplate.AllowableClass);
    if (classes != null && classes.length > 0) {
      requiredText += `<br>Classes: ${classes.map((i) => `<span class="c${i}">${CLASSES_TEXT[i]}</span>`).join(', ')}`;
    }

    // required races
    let races = this.helperService.getRaceString(itemTemplate.AllowableRace);
    if (races) {
      if (!isNaN(Number(races[0]))) {
        // @ts-ignore // TODO: fix typing and remove @ts-ignore
        races = races.map((el) => RACES_TEXT[el]);
      }
      requiredText += `<br>Races: ${races.join(', ')}`;
    }

    // required honorRank (not used anymore)
    if (!!itemTemplate.requiredhonorrank && !!PVP_RANK[itemTemplate.requiredhonorrank] && !!PVP_RANK[itemTemplate.requiredhonorrank].name) {
      requiredText += `<br>Requires ${PVP_RANK[itemTemplate.requiredhonorrank].name}`;
    }

    // required CityRank -> the value is always 0

    // required level
    if (itemTemplate.Flags & ITEM_FLAG.ACCOUNTBOUND && itemTemplate.Quality === ITEMS_QUALITY.HEIRLOOM) {
      requiredText +=
        '<br>' + ITEM_CONSTANTS.reqLevelRange.replace('%d', '1').replace('%d', MAX_LEVEL.toString()).replace('%s', MAX_LEVEL.toString());
    } else if (itemTemplate.RequiredLevel > 1) {
      requiredText += '<br>' + ITEM_CONSTANTS.reqMinLevel.replace('%d', String(itemTemplate.RequiredLevel));
    }

    // required arena team rating / personal rating / todo (low): sort out what kind of rating
    const [res, reqRating] = await this.getExtendedCost(itemTemplate.entry, itemTemplate.FlagsExtra, itemTemplate.BuyPrice);

    if (!!res && !!reqRating && res[itemTemplate.entry] && Object.keys(res[itemTemplate.entry]).length > 0 && reqRating.length > 0) {
      requiredText += '<br>' + ITEM_CONSTANTS.reqRating[reqRating[1]].replace('%d', reqRating[0]);
    }

    // item level
    const itemClass = Number(itemTemplate.class);
    const itemLevel = itemTemplate.ItemLevel;
    if (itemLevel > 0 && [ITEM_TYPE.ARMOR, ITEM_TYPE.WEAPON].includes(itemClass)) {
      requiredText += `<br>${ITEM_CONSTANTS.itemLevel.replace('%d', String(itemLevel))}`;
    }

    // required skill
    const requiredSkill = itemTemplate.RequiredSkill;
    const requiredSkillRank = itemTemplate.RequiredSkillRank;
    if (!!requiredSkill && requiredSkill > 0) {
      let reqSkill = await this.sqliteQueryService.getSkillNameById(requiredSkill);

      /* istanbul ignore else */
      if (!!reqSkill) {
        if (requiredSkillRank > 0) {
          reqSkill += ` (${requiredSkillRank})`;
        }

        requiredText += `<br>Requires: ${reqSkill}`;
      }
    }

    // required spell
    const requiredSpell = itemTemplate.requiredspell;
    if (!!requiredSpell && requiredSpell > 0) {
      requiredText += `<br>Requires <span class="q1">${await this.sqliteQueryService.getSpellNameById(requiredSpell)}</span>`;
    }

    // required reputation w/ faction
    const requiredFaction = itemTemplate.RequiredReputationFaction;
    const requiredFactionRank = itemTemplate.RequiredReputationRank;
    if (!!requiredFaction && requiredFaction > 0) {
      let reqFaction = await this.sqliteQueryService.getFactionNameById(requiredFaction);

      /* istanbul ignore else */
      if (!!reqFaction) {
        if (requiredFactionRank > 0) {
          reqFaction += ` (${FACTION_RANK[requiredFactionRank].name})`;
        }
        requiredText += `<br>Requires ${reqFaction}`;
      }
    }

    return requiredText;
  }

  private async getRequiredZone(map: number, area: number): Promise<string> {
    let requiredZone = '';

    // require map
    if (!!map) {
      const mapName = await this.sqliteQueryService.getMapNameById(map);
      requiredZone += mapName && mapName !== '' ? `<br><!-- map --><span class="q1">${mapName}</span>` : '';
    }

    // require area
    if (!!area) {
      const areaName = await this.sqliteQueryService.getAreaNameById(area);
      requiredZone += areaName && areaName !== '' ? `<br><!-- area -->${areaName}` : '';
    }

    return requiredZone;
  }

  private getDuration(duration: number, flagsCustom: number): string {
    let durationText = '';

    // max duration
    if (duration) {
      let rt = '';
      if (flagsCustom & 0x1) {
        // if CU_DURATION_REAL_TIME
        rt = ' (real time)';
      }
      durationText += `<br>Duration: ${this.formatTime(duration * 1000)}${rt}`;
    }

    return durationText;
  }

  private getMagicResistances(itemTemplate: ItemTemplate): string {
    let magicRsistances = '';

    // magic resistances
    resistanceFields.forEach((rowName, idx) => {
      const resField = itemTemplate[rowName + '_res'];
      if (rowName != null && resField != null && resField !== 0) {
        magicRsistances += `<br>+${resField} ${ITEM_CONSTANTS.resistances[idx]}`;
      }
    });

    return magicRsistances;
  }

  private getMisc(itemTemplate: ItemTemplate): string {
    const xMisc = [];

    const spellId1 = itemTemplate.spellid_1;
    const spellId2 = itemTemplate.spellid_2;
    const description = itemTemplate.description;

    // yellow text at the bottom, omit if we have a recipe
    if (!!description && !this.canTeachSpell(spellId1, spellId2)) {
      xMisc.push(`<br><span class="q">"${description}"</span>`);
    }

    // readable
    const PageText = itemTemplate.PageText;
    if (PageText > 0) {
      xMisc.push(`<br><!--pagetext--><span class="q2">${ITEM_CONSTANTS.readClick}</span>`);
    }

    // charges (I guess, checking first spell is enough)
    const spellCharges1 = itemTemplate.spellcharges_1;
    if (!!spellCharges1) {
      let charges = ITEM_CONSTANTS.charges.replace('%d', Math.abs(spellCharges1).toString());
      if (Math.abs(spellCharges1) === 1) {
        charges = charges.replace('Charges', 'Charge');
      }

      /* istanbul ignore else */
      if (!!charges && charges !== '') {
        xMisc.push(`<br><span class="q1">${charges}</span>`);
      }
    }

    return xMisc.length > 0 ? xMisc.join('') : '';
  }

  private async getGemEnchantment(entry: number): Promise<string> {
    if (!entry) {
      return '';
    }

    let gemEnchantmentText = '';
    const gemEnchantmentId = await this.getGemEnchantmentIdById(entry);

    if (!!gemEnchantmentId) {
      let gemEnch = await this.getItemEnchantmentById(gemEnchantmentId);
      if (!gemEnch || (gemEnch && gemEnch.length === 0)) {
        return '';
      }

      gemEnch = gemEnch[0];

      // @ts-ignore // TODO: fix typing and remove @ts-ignore
      if (!!gemEnch['name'] && gemEnch['name'] !== '') {
        // @ts-ignore // TODO: fix typing and remove @ts-ignore
        gemEnchantmentText += `<br><span class="q1">${gemEnch['name']}</span>`;
      }

      // activation conditions for meta gems
      // @ts-ignore // TODO: fix typing and remove @ts-ignore
      if (!!gemEnch['conditionId']) {
        // @ts-ignore // TODO: fix typing and remove @ts-ignore
        let gemCnd = await this.getItemEnchantmentConditionById(gemEnch['conditionId']);
        if (!gemCnd || (gemCnd && gemCnd.length === 0)) {
          return '';
        }

        gemCnd = gemCnd[0];

        if (!!gemCnd) {
          for (let i = 1; i < 6; i++) {
            // @ts-ignore // TODO: fix typing and remove @ts-ignore
            const gemCndColor = Number(gemCnd[`color${i}`]);

            if (!gemCndColor) {
              continue;
            }

            // @ts-ignore // TODO: fix typing and remove @ts-ignore
            const gemCndCmpColor = Number(gemCnd[`cmpColor${i}`]);
            // @ts-ignore // TODO: fix typing and remove @ts-ignore
            const gemCndComparator = Number(gemCnd[`comparator${i}`]);
            // @ts-ignore // TODO: fix typing and remove @ts-ignore
            const gemCndValue = Number(gemCnd[`value${i}`]);

            let vspfArgs: any = ['', ''];

            switch (gemCndComparator) {
              case 2: // requires less <color> than (<value> || <comparecolor>) gems
              case 5: // requires at least <color> than (<value> || <comparecolor>) gems
                vspfArgs = [gemCndValue, ITEM_CONSTANTS['gemColors'][gemCndColor - 1]];
                break;
              case 3: // requires more <color> than (<value> || <comparecolor>) gems
                vspfArgs = [ITEM_CONSTANTS['gemColors'][gemCndColor - 1], ITEM_CONSTANTS['gemColors'][gemCndCmpColor - 1]];
                break;
              default:
                break;
            }

            if (vspfArgs[0] === '' && vspfArgs[1] === '') {
              continue;
            }

            // @ts-ignore // TODO: fix typing and remove @ts-ignore
            let gemEnchText = ITEM_CONSTANTS['gemConditions'][gemCndComparator];

            /* istanbul ignore next */
            if (!!vspfArgs[0] && !!vspfArgs[1]) {
              gemEnchText = gemEnchText.replace('%s', vspfArgs[0]).replace('%s', vspfArgs[1]);
            }

            gemEnchantmentText += `<br><span class="q0">Requires ${gemEnchText}</span>`;
          }
        }
      }
    }

    return gemEnchantmentText;
  }

  private async getSocketEnchantment(itemTemplate: ItemTemplate): Promise<string> {
    let socketText = '';

    // fill native sockets
    for (let j = 1; j <= 3; j++) {
      const socketColor = Number(itemTemplate['socketColor_' + j]);

      if (!socketColor) {
        continue;
      }

      let colorId = 0;
      for (let i = 0; i < 4; i++) {
        if (socketColor & (1 << i)) {
          colorId = i;
        }
      }

      socketText += `<br><span class="socket-${ITEM_CONSTANTS.gemColors[colorId]} q0 socket${colorId}">${ITEM_CONSTANTS.socket[colorId]}</span>`;
    }

    const socketBonus = itemTemplate.socketBonus;
    if (!!socketBonus) {
      const sbonus = await this.sqliteQueryService.getSocketBonusById(socketBonus);
      const socketBonusText = `${ITEM_CONSTANTS.socketBonus.replace('%s', sbonus)}`;
      socketText += `<br><span class="q0">${socketBonusText}</span>`;
    }

    return socketText;
  }

  private async getSpellDesc(itemTemplate: ItemTemplate, green: string[]) {
    const spellId1 = itemTemplate.spellid_1;
    const spellId2 = itemTemplate.spellid_2;

    if (!this.canTeachSpell(spellId1, spellId2)) {
      // @ts-ignore // TODO: fix typing and remove @ts-ignore
      const itemSpellsAndTrigger = [];
      for (let j = 1; j <= 5; j++) {
        const spellid = itemTemplate['spellid_' + j];

        if (+spellid > 0) {
          let cooldown = itemTemplate['spellcooldown_' + j];
          const cooldownCategory = itemTemplate['spellcategory_' + j];

          if (cooldown < cooldownCategory) {
            cooldown = cooldownCategory;
          }

          cooldown = +cooldown < 5000 ? '' : ` ( ${this.formatTime(Number(cooldown))} cooldown)`;

          // @ts-ignore // TODO: fix typing and remove @ts-ignore
          itemSpellsAndTrigger[spellid] = [itemTemplate['spelltrigger_' + j], cooldown];
        }
      }

      // @ts-ignore // TODO: fix typing and remove @ts-ignore
      if (itemSpellsAndTrigger && itemSpellsAndTrigger.length > 0) {
        // @ts-ignore // TODO: fix typing and remove @ts-ignore
        const spellIDs = Object.keys(itemSpellsAndTrigger);
        for (const spellID of spellIDs) {
          // @ts-ignore // TODO: fix typing and remove @ts-ignore
          const spellTrigger = itemSpellsAndTrigger[spellID];
          const parsed = await this.sqliteQueryService.getSpellDescriptionById(spellID); // TODO: parseText correctly

          /* istanbul ignore next */
          if (spellTrigger[0] || parsed || spellTrigger[1]) {
            /* istanbul ignore next */
            green.push(
              (ITEM_CONSTANTS.trigger[spellTrigger[0]] ?? '') + (parsed ?? '') + ' ' + (ITEM_CONSTANTS.trigger[spellTrigger[1]] ?? ''),
            );
          }
        }
      }
    }
  }

  // TODO: recipes, vanity pets, mounts
  private async getLearnSpellText(itemTemplate: ItemTemplate): Promise<string> {
    /* TODO - WIP */

    let spellDesc = '';

    // const bagFamily: number = Number(itemTemplate.BagFamily);
    // const itemClass: number = Number(itemTemplate.class);
    const spellId1 = itemTemplate.spellid_1;
    const spellId2 = itemTemplate.spellid_2;

    if (!spellId1 || !spellId2) {
      return '';
    }

    if (this.canTeachSpell(spellId1, spellId2)) {
      const craftSpell = spellId2;

      if (
        /* istanbul ignore next */
        !!craftSpell
      ) {
        // let xCraft = '';

        const desc = await this.sqliteQueryService.getSpellDescriptionById(spellId2);

        if (!!desc) {
          spellDesc += `<br><!--spellDesc--><span class="q2">${ITEM_CONSTANTS.trigger[0]} ${desc}</span>`;
        }

        // TODO: spell description for recipe
        // // recipe handling (some stray Techniques have subclass == 0), place at bottom of tooltipp
        // if (itemClass === ITEM_CLASS_RECIPE || bagFamily === 16) {
        //   let craftItem  = craftSpell->curTpl['effect1CreateItemId'];

        //   if (!!craftItem) {

        //     const reagentItems = {};

        //     for (let i = 1; i <= 8; i++) {
        //       if (rId = craftSpell->getField('reagent' + i)) {
        //         reagentItems[rId] = craftSpell->getField('reagentCount' + i);
        //       }
        //     }

        //     if (!!xCraft && !!reagentItems) {
        //       let reagents = Object.keys(reagentItems);
        //       let reqReag  = [];

        //       for (const _ of reagents) {
        //         reqReag.push(`<a href="?item=${reagents->id}">${reagents->getField('name', true)}</a> (${reagentItems[reagents->id]})`);
        //       }

        //       xCraft += '<div class="q1 whtt-reagents"><br>Requires: ' + reqReag.join(', ') + '</div>';
        //     }
        //   }
        // }
      }
    }

    return spellDesc;
  }

  // locked or openable
  private async getLockText(flags: number, lockid: number): Promise<string> {
    let lockText = '';

    if (!!lockid) {
      const lockData = await this.getLocks(lockid);

      if (!!lockData && lockData.length > 0) {
        lockText += `<br><span class="q0">Locked${lockData.join('')}</span>`;
      } else if (flags & ITEM_FLAG.OPENABLE) {
        lockText += `<br><!--lockData--><span class="q2">${ITEM_CONSTANTS.openClick}</span>`;
      }
    }

    return lockText;
  }

  public async calculatePreview(itemTemplate: ItemTemplate): Promise<string> {
    let tmpItemPreview = '';
    const green: string[] = [];

    const flags = itemTemplate.Flags;
    const bagFamily: number = Number(itemTemplate.BagFamily);
    const quality: number = Number(itemTemplate.Quality);

    // ITEM NAME
    const itemName = itemTemplate.name;
    if (itemName) {
      tmpItemPreview += `<b class="item-name q${!isNaN(quality) ? quality : ''}">${itemName}</b>`;
    }

    // heroic tag
    if (flags & ITEM_FLAG.HEROIC && quality === ITEMS_QUALITY.EPIC) {
      tmpItemPreview += '<br><!-- ITEM_FLAG.HEROIC --><span class="q2">Heroic</span>';
    }

    tmpItemPreview += await this.getRequiredZone(Number(itemTemplate.Map), Number(itemTemplate.area));

    // conjured
    if (flags & ITEM_FLAG.CONJURED) {
      tmpItemPreview += '<br> Conjured Item';
    }

    tmpItemPreview += await this.getBonding(itemTemplate);
    tmpItemPreview += this.getDuration(itemTemplate.duration, itemTemplate.flagsCustom);

    // required holiday
    const holiday = itemTemplate.HolidayId;
    if (!!holiday) {
      const eventName = await this.sqliteQueryService.getEventNameByHolidayId(holiday);
      tmpItemPreview += `<br>Requires ${eventName}`;
    }

    // item begins a quest
    const startquest: number = Number(itemTemplate.startquest);
    if (!!startquest && startquest > 0) {
      tmpItemPreview += `<br><span class="q1">This Item Begins a Quest</span>`;
    }

    // containerType (slotCount)
    const containerSlots: number = Number(itemTemplate.ContainerSlots);
    if (containerSlots > 0) {
      const fam = bagFamily ? Math.log2(bagFamily) + 1 : 0;
      tmpItemPreview += `<br>${containerSlots} Slot ${ITEM_CONSTANTS.bagFamily[fam] ?? ''}`;
    }

    tmpItemPreview += this.getClassText(itemTemplate.InventoryType, itemTemplate.class, itemTemplate.subclass);
    tmpItemPreview += this.getDamageText(itemTemplate);
    tmpItemPreview += this.getArmorText(itemTemplate);

    // Item is a gem (don't mix with sockets)
    tmpItemPreview += await this.getGemEnchantment(itemTemplate.entry);

    // Random Enchantment - if random enchantment is set, prepend stats from it
    const RandomProperty: number = itemTemplate.RandomProperty;
    const RandomSuffix: number = itemTemplate.RandomSuffix;
    if (!!RandomProperty || !!RandomSuffix) {
      tmpItemPreview += `<br><!--randEnchant--><span class="q2">${ITEM_CONSTANTS.randEnchant}</span>`;
    }

    // itemMods (display stats and save ratings for later use)
    tmpItemPreview += this.getStats(itemTemplate, green);

    tmpItemPreview += this.getMagicResistances(itemTemplate);

    // Socket & Enchantment (TODO)
    tmpItemPreview += await this.getSocketEnchantment(itemTemplate);

    // durability
    const durability = itemTemplate.MaxDurability;
    if (durability) {
      tmpItemPreview += `<br>${ITEM_CONSTANTS.durability.replace(/%d/g, durability.toString())}`;
    }

    tmpItemPreview += await this.getRequiredText(itemTemplate);

    const lockid = itemTemplate.lockid;
    tmpItemPreview += await this.getLockText(flags, lockid);

    // spells on item
    await this.getSpellDesc(itemTemplate, green);

    if (!!green && green.length > 0) {
      for (const bonus of green) {
        if (!!bonus) {
          tmpItemPreview += `<br><!--bonus--><span class="q2">${bonus}</span>`;
        }
      }
    }

    tmpItemPreview += await this.getItemSet(itemTemplate.entry, itemTemplate.itemset);

    // recipes, vanity pets, mounts
    tmpItemPreview += await this.getLearnSpellText(itemTemplate);

    tmpItemPreview += this.getMisc(itemTemplate);

    const sellPrice = itemTemplate.SellPrice;
    if (!!sellPrice && sellPrice > 0) {
      tmpItemPreview += '<br>Sell Price: ' + this.helperService.formatMoney(sellPrice);
    }

    return tmpItemPreview;
  }
}
