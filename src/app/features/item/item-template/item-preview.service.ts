import { Injectable } from '@angular/core';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { ItemTemplateService } from './item-template.service';
import { SqliteQueryService } from '@keira-shared/services/sqlite-query.service';
import { ITEM_TYPE, ITEM_MOD } from '@keira-shared/constants/options/item-class';
import { ITEM_CONSTANTS } from './item-constants';
import { MAX_LEVEL, lvlIndepRating, gtCombatRatings, CLASSES, RACE, resistanceFields } from './item-preview';
import { ITEM_FLAG } from '@keira-shared/constants/flags/item-flags';
import { ITEMS_QUALITY } from '@keira-shared/constants/options/item-quality';

@Injectable()
export class ItemPreviewService {
  private readonly ITEM_CONSTANTS = ITEM_CONSTANTS;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    private readonly editorService: ItemTemplateService,
    private readonly sqliteQueryService: SqliteQueryService,
    private readonly mysqlQueryService: MysqlQueryService,
  ) { }

  /**
   * query functions
   */

  private getItemsetSlotBak(itemset: number | string): Promise<any[]> {
    return this.sqliteQueryService.query(`SELECT * FROM items WHERE itemset = ${itemset} ORDER BY slotBak, id`).toPromise();
  }

  private getItemNameByIDsASC(IDs: number[]): Promise<any[]> {
    return this.mysqlQueryService.query(`SELECT name FROM item_template WHERE entry IN (${IDs.join(',')}) ORDER BY entry ASC`).toPromise();
  }

  private getItemsetById(ID: number | string): Promise<any[]> {
    return this.sqliteQueryService.query(`SELECT * FROM itemset WHERE id = ${ID}`).toPromise();
  }

  private getItemLimitCategoryById(id: number | string): Promise<any[]> {
    return this.sqliteQueryService.query(`SELECT * FROM item_limit_category WHERE id = ${id}`).toPromise();
  }

  private getGemEnchantmentIdById(id: number | string): Promise<string|number> {
    return this.sqliteQueryService.queryValue(`SELECT gemEnchantmentId AS v FROM items WHERE id = ${id};`).toPromise();
  }

  private getItemEnchantmentById(id: number | string): Promise<any[]> {
    return this.sqliteQueryService.query(`SELECT * FROM item_enchantment WHERE id = ${id}`).toPromise();
  }

  private getItemExtendedCost(IDs: number[]): Promise<any[]> {
    return this.sqliteQueryService.query(`SELECT * FROM item_extended_cost WHERE id IN (${IDs.join(',')})`).toPromise();
  }

  private getItemEnchantmentConditionById(id: number | string): Promise<any[]> {
    return this.sqliteQueryService.query(`SELECT * FROM item_enchantment_condition WHERE id = ${id}`).toPromise();
  }

  private getItemExtendedCostFromVendor(id: number | string): Promise<any[]> {
    return this.mysqlQueryService.query(`SELECT
      nv.item,
      nv.entry,
      0 AS eventId,
      nv.maxcount,
      nv.extendedCost
    FROM
      npc_vendor nv
    WHERE
      nv.item = ${id}
    UNION SELECT
      genv.item,
      c.id AS \`entry\`,
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
      genv.item = ${id};`).toPromise();
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
      ITEM_MOD.RESILIENCE_RATING
    ];

    if (rating.includes(type) && level < 34) {
      level = 34;
    }

    if (gtCombatRatings[type]) {
      let c: number;
      if (level > 70) {
        c = 82 / 52 * Math.pow(131 / 63, (level - 70) / 10);
      } else if (level > 60) {
        c = 82 / (262 - 3 * level);
      } else if (level > 10) {
        c = (level - 8) / 52;
      } else {
        c = 2 / 52;
      }
      // do not use localized number format here!
      result = (val / gtCombatRatings[type] / c).toFixed(2);
    }

    if (![ITEM_MOD.DEFENSE_SKILL_RATING, ITEM_MOD.EXPERTISE_RATING].includes(type)) {
      result += '%';
    }

    return ITEM_CONSTANTS.ratingString
      .replace('%s', `<!--rtg%${type}-->${result}`)
      .replace('%s', `<!--lvl-->${level}`);
  }

  private parseRating(type: number, value: number): string {

    const requiredLevel = this.editorService.form.controls.RequiredLevel.value;

    // clamp level range
    const level = requiredLevel > 1 ? requiredLevel : MAX_LEVEL;

    // unknown rating
    if ([2, 8, 9, 10, 11].includes[type] || type > ITEM_MOD.BLOCK_VALUE || type < 0) {
      return '';
    }

    if (lvlIndepRating.includes[type]) { // level independant Bonus
      return ITEM_CONSTANTS.trigger[1] + ITEM_CONSTANTS.statType[type].replace('%d', `<!--rtg${type}-->${value}`);
    }

     // rating-Bonuses
    const js = `&nbsp;<small>(${this.setRatingLevel(level, type, value)})</small>`;
    return ITEM_CONSTANTS.trigger[1] + ITEM_CONSTANTS.statType[type].replace('%d', `<!--rtg${type}-->${value}${js}`);
  }

  private getRequiredClass(classMask: number): string[] {
    classMask &= CLASSES.MASK_ALL; // clamp to available classes..

    if (classMask === CLASSES.MASK_ALL) { // available to all classes
      return null;
    }

    const tmp = [];
    let i = 1;
    while (classMask) {
      if (classMask & (1 << (i - 1))) {
        const tmpClass = ITEM_CONSTANTS.cl[i];
        if (tmpClass != null && tmpClass !== '') {
          tmp.push(`<span class="c${i}">${tmpClass}</span>`);
        }

        classMask &= ~(1 << (i - 1));
      }
      i++;
    }

    return tmp;
  }

  private getRaceString(raceMask: number): string[] {
    // clamp to available races
    raceMask &= RACE.MASK_ALL;
    // available to all races (we don't display 'both factions')
    if (!raceMask || raceMask === RACE.MASK_ALL) {
      return null;
    }

    if (raceMask === RACE.MASK_HORDE) {
      return [ITEM_CONSTANTS.ra['-2']];
    }

    if (raceMask === RACE.MASK_ALLIANCE) {
      return [ITEM_CONSTANTS.ra['-1']];
    }

    const tmp  = [];
    let i = 1;
    while (raceMask) {
      if (raceMask & (1 << (i - 1))) {
        const tmpRace = ITEM_CONSTANTS.ra[i];
        if (tmpRace != null && tmpRace !== '') {
          tmp.push(tmpRace);
        }
        raceMask &= ~(1 << (i - 1));
      }
      i++;
    }

    return tmp;
  }

  private formatMoney(qty: number): string {
    let money = '';

    if (qty >= 10000) {
      const g = Math.floor(qty / 10000);
      money += `<span class="moneygold">${g}</span> &nbsp;`;
      qty -= g * 10000;
    }

    if (qty >= 100) {
      const s = Math.floor(qty / 100);
      money += `<span class="moneysilver">${s}</span> &nbsp;`;
      qty -= s * 100;
    }

    if (qty > 0) {
      money += `<span class="moneycopper">${qty}</span> &nbsp;`;
    }

    return money;
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

    if (sec > 0) {
      time['s'] = sec;
      sec -= time['s'];
    }

    if ((sec * 1000) % 1000) {
      time.ms = sec * 1000;
    }

    return time;
  }

  private formatTime(base, short = false) {
    const s = this.parseTime(base / 1000);
    let tmp: number;

    if (short) {
      tmp = Math.round(s.d / 364);
      if (tmp !== 0) {
        return tmp + ' ' + ITEM_CONSTANTS.timeUnits.ab[0];
      }

      tmp = Math.round(s.d / 30);
      if (tmp !== 0) {
        return tmp + ' ' + ITEM_CONSTANTS.timeUnits.ab[1];
      }
      tmp = Math.round(s.d / 7);
      if (tmp !== 0) {
        return tmp + ' ' + ITEM_CONSTANTS.timeUnits.ab[2];
      }
      tmp = Math.round(s.d);
      if (tmp !== 0) {
        return tmp + ' ' + ITEM_CONSTANTS.timeUnits.ab[3];
      }
      tmp = Math.round(s.h);
      if (tmp !== 0) {
        return tmp + ' ' + ITEM_CONSTANTS.timeUnits.ab[4];
      }
      tmp = Math.round(s.m);
      if (tmp !== 0) {
        return tmp + ' ' + ITEM_CONSTANTS.timeUnits.ab[5];
      }
      tmp = Math.round(s.s + s.ms / 1000);
      if (tmp !== 0) {
        return tmp + ' ' + ITEM_CONSTANTS.timeUnits.ab[6];
      }
      if (s.ms !== 0) {
        return s.ms + ' ' + ITEM_CONSTANTS.timeUnits.ab[7];
      }

      return '0 ' + ITEM_CONSTANTS.timeUnits.ab[6];
    }

    tmp = s.d + s.h / 24;
    if (tmp > 1 && !(tmp % 364)) {                      // whole years
      return Math.round((s.d + s.h / 24) / 364) + ' ' + ITEM_CONSTANTS.timeUnits[s.d / 364 === 1 && !s.h ? 'sg' : 'pl'][0];
    }
    if (tmp > 1 && !(tmp % 30)) {                       // whole month
      return Math.round((s.d + s.h / 24) /  30) + ' ' + ITEM_CONSTANTS.timeUnits[s.d /  30 === 1 && !s.h ? 'sg' : 'pl'][1];
    }
    if (tmp > 1 && !(tmp % 7)) {                        // whole weeks
      return Math.round((s.d + s.h / 24) /   7) + ' ' + ITEM_CONSTANTS.timeUnits[s.d / 7 === 1 && !s.h ? 'sg' : 'pl'][2];
    }
    if (s.d !== 0) {
      return Math.round(s.d + s.h  /   24) + ' ' + ITEM_CONSTANTS.timeUnits[s.d === 1 && !s.h  ? 'sg' : 'pl'][3];
    }
    if (s.h !== 0) {
      return Math.round(s.h + s.m  /   60) + ' ' + ITEM_CONSTANTS.timeUnits[s.h === 1 && !s.m  ? 'sg' : 'pl'][4];
    }
    if (s.m !== 0) {
      return Math.round(s.m + s.s  /   60) + ' ' + ITEM_CONSTANTS.timeUnits[s.m === 1 && !s.s  ? 'sg' : 'pl'][5];
    }
    if (s.s !== 0) {
      return Math.round(s.s + s.ms / 1000) + ' ' + ITEM_CONSTANTS.timeUnits[s.s === 1 && !s.ms ? 'sg' : 'pl'][6];
    }
    if (s.ms !== 0) {
      return s.ms + ' ' + ITEM_CONSTANTS.timeUnits[s.ms === 1 ? 'sg' : 'pl'][7];
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

  private canTeachSpell(spellId1: number, spellId2: number = null): boolean {
    // 483:   learn recipe;
    // 55884: learn mount/pet
    if (![483, 55884].includes(spellId1)) {
      return false;
    }

    // needs learnable spell
    return !!spellId2;
  }

  private async getLocks(lockId: number): Promise<string[]> {
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

      if (lockType === 1) {                      // opened by item
        name = await this.mysqlQueryService.getItemNameById(prop);

        if (!name) {
          continue;
        }
      } else if (lockType === 2) {                 // opened by skill

        // exclude unusual stuff
        if (![1, 2, 3, 4, 9, 16, 20].includes(Number(prop))) {
          continue;
        }

        name = ITEM_CONSTANTS.lockType[prop];

        if (!name) {
          continue;
        }

        if (rank > 0) {
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
  private async getExtendedCost(filter = []): Promise<any[]> {
    const flagsExtra = Number(this.editorService.form.controls.FlagsExtra.value);
    const buyPrice = Number(this.editorService.form.controls.BuyPrice.value);
    const entry = Number(this.editorService.form.controls.entry.value);

    const itemz = {};
    let xCostData = [];
    const xCostDataArr = {};
    const rawEntries = await this.getItemExtendedCostFromVendor(entry);

    if (!rawEntries) {
      return [];
    }

    for (const costEntry of rawEntries) {
      if (costEntry.extendedCost) {
        xCostData.push(costEntry.extendedCost);
      }

      if (itemz[costEntry.item] && itemz[costEntry.item][costEntry.entry]) {
        itemz[costEntry.item][costEntry.entry] = [costEntry];
      } else {
        itemz[costEntry.item] = {};
        itemz[costEntry.item][costEntry.entry] = [];
        itemz[costEntry.item][costEntry.entry].push(costEntry);
      }
    }

    if (!!xCostData && xCostData.length > 0) {
      xCostData = Array.from(new Set(xCostData)); // filter duplicates
      xCostData = await this.getItemExtendedCost(xCostData);

      if (!xCostData) {

        // converting xCostData to ARRAY_KEY structure
        for (const xCost of xCostData) {
          xCostDataArr[xCost.id] = xCost;
        }
      }
    }

    const cItems = [];

    for (const [k, vendors] of Object.entries(itemz)) {
      for (const [l, vendor] of Object.entries(vendors)) {
        for (const [m, vInfo] of Object.entries(vendor)) {

          let costs = [];
          if (xCostDataArr[vInfo['extendedCost']] && Object.keys(xCostDataArr[vInfo['extendedCost']]).length > 0) {
            costs = xCostDataArr[vInfo['extendedCost']];
          }

          const data = {
            stock:      vInfo['maxcount'] ?? -1,
            event:      vInfo['eventId'],
            reqRating:  costs ? costs['reqPersonalRating'] : 0,
            reqBracket: costs ? costs['reqArenaSlot']      : 0
          };

          // hardcode arena(103) & honor(104)
          if (costs['reqArenaPoints'] > 0) {
            data[-103] = costs['reqArenaPoints'];
          }

          if (costs['reqHonorPoints'] > 0) {
            data[-104] = costs['reqHonorPoints'];
          }

          for (let i = 1; i < 6; i++) {
            if (costs['reqItemId' + i] /* && costs['reqItemId' + i].length > 0 */
            && costs['itemCount' + i] && costs['itemCount' + i] > 0) {
              data[costs['reqItemId' + i]] = costs['itemCount' + i];
              cItems.push(costs['reqItemId' + i]);
            }
          }

          // no extended cost or additional gold required
          if (!costs || flagsExtra & 0x04) {
            if (!!buyPrice) {
              data[0] = buyPrice;
            }
          }

          vendor[m] = data;
        }
        vendors[l] = vendor;
      }

      itemz[k] = vendors;
    }

    // convert items to currency if possible
    if (!!cItems) {

      for (const [itemId, vendors] of Object.entries(itemz)) {
        for (const [npcId, costData] of Object.entries(vendors)) {
          for (const [itr, cost] of Object.entries(costData)) {
            for (const [k, v] of Object.entries(cost)) {
              if (cItems.includes(k)) {
                let found = false;
                for (const item of cItems) {
                  if (item.id === k) {
                    delete cost[k];
                    cost[-item.id] = v;
                    found = true;
                    break;
                  }
                }
              }
            }
            costData[itr] = cost;
          }
          vendors[npcId] = costData;
        }
        itemz[itemId] = vendors;
      }
    }

    const result = itemz;

    let reqRating = [];
    for (const [itemId, data] of Object.entries(result)) {
      reqRating = [];
      for (const [npcId, entries] of Object.entries(data)) {
        for (const costs of entries) {
          // reqRating isn't really a cost .. so pass it by ref instead of return
          // use highest total value
          if (data[npcId] &&
                costs['reqRating'] &&
                (reqRating.length === 0 || (reqRating && reqRating[0] < costs['reqRating']))
          ) {
            reqRating = [costs['reqRating'], costs['reqBracket']];
          }
        }
      }

      if (!(data)) {
        delete result[itemId];
      }
    }

    return [result, reqRating];
  }

  /**
   * get item preview text
   */

  private getDamageText(): string {
    // Weapon/Ammunition Stats (not limited to weapons (see item:1700))
    const itemClass: number = Number(this.editorService.form.controls.class.value);
    const subclass: number = Number(this.editorService.form.controls.subclass.value);
    const dmgmin1 = this.editorService.form.controls.dmg_min1.value;
    const dmgmin2 = this.editorService.form.controls.dmg_min2.value;
    const dmgmax1 = this.editorService.form.controls.dmg_max1.value;
    const dmgmax2 = this.editorService.form.controls.dmg_max2.value;
    const speed = this.editorService.form.controls.delay.value / 1000;
    const sc1 = this.editorService.form.controls.dmg_type1.value;
    const sc2 = this.editorService.form.controls.dmg_type2.value;
    const dmgmin = dmgmin1 + dmgmin2;
    const dmgmax = dmgmax1 + dmgmax2;
    const dps = speed ? (dmgmin + dmgmax) / (2 * speed) : 0;

    let damageText = '';
    let dmg = '';

    if (itemClass === ITEM_TYPE.AMMUNITION && dmgmin && dmgmax) {
      if (sc1) {
        damageText += ITEM_CONSTANTS.damage.ammo[1].replace('%d', ((dmgmin + dmgmax) / 2).toString()) + ITEM_CONSTANTS.sc[sc1];
      } else {
        damageText += ITEM_CONSTANTS.damage.ammo[0].replace('%d', ((dmgmin + dmgmax) / 2).toString());
      }
    } else if (dps) {
      if (dmgmin1 === dmgmax1) {
        dmg = ITEM_CONSTANTS.damage.single[sc1 ? 1 : 0]
          .replace('%g', dmgmin1)
          .replace('%s', (sc1 ? ITEM_CONSTANTS.sc[sc1] : ''));
      } else {
        dmg = ITEM_CONSTANTS.damage.range[sc1 ? 1 : 0]
          .replace('%d', dmgmin1)
          .replace('%d', dmgmax1)
          .replace('%s', sc1 ? ITEM_CONSTANTS.sc[sc1] : '');
      }

      if (itemClass === ITEM_TYPE.WEAPON) {
        damageText += `<table style="float: left; width: 100%;"><tr><td>${dmg}</td><td>&nbsp;&nbsp;&nbsp;&nbsp;</td><th style="text-align: right;">Speed <!--spd-->${speed.toFixed(2)}</th></tr></table>`;
      } else {
        damageText += `<br><!--dmg-->${dmg}`;
      }

      // secondary damage is set
      if ((dmgmin2 || dmgmax2) && dmgmin2 !== dmgmax2) {
        damageText += ITEM_CONSTANTS.damage.range[sc2 ? 3 : 2]
          .replace('%d', dmgmin2)
          .replace('%d', dmgmax2)
          .replace('%s', sc2 ? ITEM_CONSTANTS.sc[sc2] : '');
      } else if (dmgmin2) {
        damageText += ITEM_CONSTANTS.damage.single[sc2 ? 3 : 2]
          .replace('%d', dmgmin2)
          .replace('%s', sc2 ? ITEM_CONSTANTS.sc[sc2] : '');
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

  private getStats(greenText: string[]): string {
    let stats = '';

    for (let i = 1; i <= 10; i++) {
      const type = this.editorService.form.controls['stat_type' + i].value;
      const qty = this.editorService.form.controls['stat_value' + i].value;

      if (!qty || type <= 0) {
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
        default: // rating with % for reqLevel
          greenText.push(this.parseRating(type, qty));
      }
    }

    return stats;
  }

  private async getItemSet(): Promise<string> {
    const itemset = this.editorService.form.controls.itemset.value;
    const entry = this.editorService.form.controls.entry.value;

    if (!itemset) {
      return '';
    }

    let itemsetText = '';

    const itemsetPieces = await this.getItemsetSlotBak(itemset);

    // check if there are multiple itemset with the same itemset ID
    let multipleItemset = false;

    if (itemsetPieces && itemsetPieces.length > 10) {
      multipleItemset = true;
    } else {
      const slotBak = [];
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

    if (!itemsName) {
      return '';
    }

    for (let i = 0; i < itemsName.length; i++) {
      itemsName[i] = itemsName[i].name;
    }

    let itemsetAttr = await this.getItemsetById(itemset);
    itemsetAttr = itemsetAttr ? itemsetAttr[0] : null;

    if (!itemsetAttr) {
      return '';
    }

    itemsetText += '<br><br><span class="q">' + ITEM_CONSTANTS.setName
      .replace('%s', `${itemsetAttr['name']}</span>`)
      .replace('%d', '0')
      .replace('%d', itemsName.length.toString())
      + '</span>';


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
            entry: itemsetAttr['spell' + setSpellsAndIdx[s]],
            bonus: itemsetAttr['bonus' + setSpellsAndIdx[s]],
          });
        }
      }

      // sort and list bonuses
      itemsetText += '<span class="q0">';
      for (let i = 0; i < setSpells.length; i++) {
        for (let j = i; j < setSpells.length; j++) {
          if (setSpells[j]['bonus'] >= setSpells[i]['bonus']) {
            continue;
          }

          const tmp = setSpells[i];
          setSpells[i] = setSpells[j];
          setSpells[j] = tmp;
        }

        const bonusText = ITEM_CONSTANTS.setBonus
          .replace('%d', setSpells[i]['bonus'])
          .replace('%s', setSpells[i]['tooltip']);

        itemsetText += `<br><span>${bonusText}</span>`;
      }
      itemsetText += '</span>';

    return itemsetText;
  }

  private async getBonding(): Promise<string> {
    let bondingText = '';

    const flags = this.editorService.form.controls.Flags.value;
    const bonding: number = Number(this.editorService.form.controls.bonding.value);
    const maxcount: number = Number(this.editorService.form.controls.maxcount.value);
    const bagFamily: number = Number(this.editorService.form.controls.BagFamily.value);
    const itemLimitCategory = this.editorService.form.controls.ItemLimitCategory.value;

    // bonding
    if (flags & ITEM_FLAG.ACCOUNTBOUND) {
      bondingText += '<br><!-- bonding[0] -->' + this.ITEM_CONSTANTS.bonding[0];
    } else if (bonding) {
      bondingText += '<br><!-- [bonding] -->' + this.ITEM_CONSTANTS.bonding[bonding];
    }

    // unique || unique-equipped || unique-limited
    if (maxcount === 1) {
      bondingText += '<br><!-- unique[0] -->' + this.ITEM_CONSTANTS['unique'][0];
    } else if (maxcount && bagFamily !== 8192) { // not for currency tokens
      bondingText += '<br><!-- unique[1] -->' + this.ITEM_CONSTANTS['unique'][1].replace('%d', maxcount.toString());
    } else if (flags & ITEM_FLAG.UNIQUEEQUIPPED) {
      bondingText += '<br><!-- uniqueEquipped -->' + this.ITEM_CONSTANTS['uniqueEquipped'][0];
    } else if (itemLimitCategory) {
      let limit: any = await this.getItemLimitCategoryById(itemLimitCategory);
      limit = limit[0];

      const index = limit && limit.isGem ? 'uniqueEquipped' : 'unique';
      bondingText += '<br><!-- unique isGem -->' + ITEM_CONSTANTS[index][2].replace('%s', limit.name).replace('%d', limit.count);
    }

    return bondingText;
  }

  private getClassText(): string {
    let classText = '';

    const inventoryType: number = Number(this.editorService.form.controls.InventoryType.value);
    const itemClass: number = Number(this.editorService.form.controls.class.value);
    const subclass: number = Number(this.editorService.form.controls.subclass.value);

    let textRight = '';
    if ([ITEM_TYPE.ARMOR, ITEM_TYPE.WEAPON, ITEM_TYPE.AMMUNITION].includes(itemClass)) {
      classText += '<table style="float: left; width: 100%;"><tr>';

      // Class
      if (inventoryType) {
        classText += `<td>${ITEM_CONSTANTS.inventoryType[inventoryType]}</td>`;
        textRight = 'style="text-align: right;"';
      }

      // Subclass
      if (itemClass === ITEM_TYPE.ARMOR && subclass > 0) {
        classText += `<th ${textRight}><!--asc ${subclass} -->${ITEM_CONSTANTS.armorSubClass[subclass]}</th>`;
      } else if (itemClass === ITEM_TYPE.WEAPON) {
        classText += `<th ${textRight}>${ITEM_CONSTANTS.weaponSubClass[subclass]}</th>`;
      } else if (itemClass === ITEM_TYPE.AMMUNITION) {
        classText += `<th ${textRight}>${ITEM_CONSTANTS.projectileSubClass[subclass]}</th>`;
      }

      classText += '</tr></table>';

      // inventoryType/slot can occur on random items and is then also displayed <_< .. excluding Bags >_>
    } else if (inventoryType && itemClass !== ITEM_TYPE.CONTAINER && !!ITEM_CONSTANTS.inventoryType[subclass]) {
      classText += `<br><!-- InventoryType -->${ITEM_CONSTANTS.inventoryType[subclass]}`;
    }

    return classText;
  }

  private getArmorText(): string {
    let armorText = '';

    // Armor
    const armorDamageModifier = this.editorService.form.controls.ArmorDamageModifier.value;
    const armor = this.editorService.form.controls.armor.value;
    const itemClass: number = Number(this.editorService.form.controls.class.value);
    if (itemClass === ITEM_TYPE.ARMOR && armorDamageModifier > 0) {
      armorText += `<br><span class="q2"><!--addamr${armorDamageModifier}--><span>${ITEM_CONSTANTS.armor.replace('%s', armor)}</span></span>`;
    } else if (armor) {
      armorText += `<br><span><!--amr-->${ITEM_CONSTANTS.armor.replace('%s', armor)}</span>`;
    }

    // Block (note: block value from field block and from field stats or parsed from itemSpells are displayed independently)
    const block = this.editorService.form.controls.block.value;
    if (block) {
      armorText += `<br><span>${ITEM_CONSTANTS.block.replace('%s', block)}</span>`;
    }

    return armorText;
  }

  private async getRequiredText(): Promise<string> {
    let requiredText = '';

    const flags = this.editorService.form.controls.Flags.value;
    const quality: number = Number(this.editorService.form.controls.Quality.value);
    const requiredLevel = this.editorService.form.controls.RequiredLevel.value;

    // required classes
    const allowableClasses = this.editorService.form.controls.AllowableClass.value;
    const classes = this.getRequiredClass(allowableClasses);
    if (classes != null && classes.length > 0) {
      requiredText += `<br>Classes: ${classes.join(', ')}`;
    }

    // required races
    const allowableRaces = this.editorService.form.controls.AllowableRace.value;
    const races = this.getRaceString(allowableRaces);
    if (races) {
      requiredText += `<br>Races: ${races.join(', ')}`;
    }

    // required honorRank (not used anymore)
    const requiredhonorrank = this.editorService.form.controls.requiredhonorrank.value;
    if (requiredhonorrank) {
      requiredText += `<br>Requires ${ITEM_CONSTANTS.pvpRank[requiredhonorrank]}`;
    }

    // required CityRank -> the value is always 0

    // required level
    if ((flags & ITEM_FLAG.ACCOUNTBOUND) && quality === ITEMS_QUALITY.HEIRLOOM) {

      requiredText += '<br>' + ITEM_CONSTANTS.reqLevelRange
        .replace('%d', '1')
        .replace('%d', MAX_LEVEL.toString())
        .replace('%s', MAX_LEVEL.toString());

    } else if (requiredLevel > 1) {
      requiredText += '<br>' + ITEM_CONSTANTS.reqMinLevel.replace('%d', requiredLevel);
    }

    // required arena team rating / personal rating / todo (low): sort out what kind of rating
    const entry = this.editorService.form.controls.entry.value;

    const [res, reqRating] = await this.getExtendedCost();

    if (res[entry] && Object.keys(res[entry]).length > 0 && reqRating.length > 0) {
      requiredText += '<br>' + ITEM_CONSTANTS.reqRating[reqRating[1]].replace('%d', reqRating[0]);
    }

    // item level
    const itemClass: number = Number(this.editorService.form.controls.class.value);
    const itemLevel = this.editorService.form.controls.ItemLevel.value;
    if (itemLevel > 0 && [ITEM_TYPE.ARMOR, ITEM_TYPE.WEAPON].includes(itemClass)) {
      requiredText += `<br>${ITEM_CONSTANTS.itemLevel.replace('%d', itemLevel)}`;
    }

    // required skill
    const requiredSkill = this.editorService.form.controls.RequiredSkill.value;
    const requiredSkillRank = this.editorService.form.controls.RequiredSkillRank.value;
    if (requiredSkill > 0) {
      let reqSkill = await this.sqliteQueryService.getSkillNameById(requiredSkill);
      if (requiredSkillRank > 0) {
        reqSkill += ` (${requiredSkillRank})`;
      }

      requiredText += `<br>Requires: ${reqSkill}`;
    }

    // required spell
    const requiredSpell = this.editorService.form.controls.requiredspell.value;
    if (requiredSpell > 0) {
      requiredText += `<br>Requires <span class="q1">${await this.sqliteQueryService.getSpellNameById(requiredSpell)}</span>`;
    }

    // required reputation w/ faction
    const requiredFaction = this.editorService.form.controls.RequiredReputationFaction.value;
    const requiredFactionRank = this.editorService.form.controls.RequiredReputationRank.value;
    if (requiredFaction > 0) {
      let reqFaction = await this.sqliteQueryService.getFactionNameById(requiredFaction);
      if (requiredFactionRank > 0) {
        reqFaction += ` (${requiredFactionRank})`;
      }
      requiredText += `<br>Requires ${reqFaction}`;
    }

    return requiredText;
  }

  private async getRequiredZone(): Promise<string> {
    let requiredZone = '';

    // require map
    const map = this.editorService.form.controls.Map.value;
    if (!!map) {
      const mapName = await this.sqliteQueryService.getMapNameById(map);
      requiredZone += `<br><!-- map --><span class="q1">${mapName}</span>`;
    }

    // require area
    const area = this.editorService.form.controls.area.value;
    if (!!area) {
      const areaName = await this.sqliteQueryService.getAreaNameById(area);
      requiredZone += `<br><!-- area -->${areaName}`;
    }

    return requiredZone;
  }

  private getDuration(): string {
    let durationText = '';

    // max duration
    const duration = Math.abs(this.editorService.form.controls.duration.value);
    const flagsCustom = this.editorService.form.controls.flagsCustom.value;
    if (duration) {
      let rt = '';
      if (flagsCustom & 0x1) { // if CU_DURATION_REAL_TIME
        rt = ' (real time)';
      }
      durationText += `<br>Duration: ${this.formatTime(duration * 1000)} ${rt}`;
    }

    return durationText;
  }

  private getMagicResistances(): string {
    let magicRsistances = '';

    // magic resistances
    resistanceFields.forEach((rowName, idx) => {
      const resField = this.editorService.form.controls[rowName + '_res'].value;
      if (rowName != null && resField != null && resField !== 0) {
        magicRsistances += `<br>+${resField} ${ITEM_CONSTANTS.resistances[idx]}`;
      }
    });

    return magicRsistances;
  }

  private getMisc(): string {
    const xMisc = [];

    const spellId1 = this.editorService.form.controls.spellid_1.value;
    const spellId2 = this.editorService.form.controls.spellid_2.value;
    const description = this.editorService.form.controls.description.value;

    // yellow text at the bottom, omit if we have a recipe
    if (!!description && !this.canTeachSpell(spellId1, spellId2)) {
      xMisc.push(`<br><span class="q">"${description}"</span>`);
    }

    // readable
    const PageText = this.editorService.form.controls.PageText.value;
    if (PageText > 0) {
      xMisc.push(`<br><span class="q2">${ITEM_CONSTANTS.readClick}</span>`);
    }

    // charges (I guess, checking first spell is enough)
    const spellCharges1 = this.editorService.form.controls.spellcharges_1.value;
    if (!!spellCharges1) {

      const charges = ITEM_CONSTANTS.charges.replace('%d', Math.abs(spellCharges1).toString());
      if (Math.abs(spellCharges1) === 1) {
        charges.replace('Charges', 'Charge');
      }

      if (!!charges && charges !== '') {
        xMisc.push(`<br><span class="q1">${charges}</span>`);
      }
    }

    return xMisc.length > 0 ? xMisc.join('') : '';
  }

  private async getGemEnchantment(): Promise<string> {
    let gemEnchantmentText = '';

    const entry = this.editorService.form.controls.entry.value;
    const gemEnchantmentId = await this.getGemEnchantmentIdById(entry);

    if (!!gemEnchantmentId) {
      let gemEnch = await this.getItemEnchantmentById(gemEnchantmentId);
      gemEnch = gemEnch ? gemEnch[0] : null;

      gemEnchantmentText += `<br><span class="q1">${gemEnch['name']}</span>`;

      // activation conditions for meta gems
      if (!!gemEnch['conditionId']) {
        let gemCnd = await this.getItemEnchantmentConditionById(gemEnch['conditionId']);
        gemCnd = gemCnd ? gemCnd[0] : null;

        if (!!gemCnd) {

          const gemConditions = ITEM_CONSTANTS['gemConditions'];

          for (let i = 1; i < 6; i++) {
            if (!gemCnd['color' + i]) {
              continue;
            }

            const gemCndColor = Number(gemCnd[`color${i}`]);
            const gemCndCmpColor = Number(gemCnd[`cmpColor${i}`]);
            const gemCndComparator = gemCnd[`comparator${i}`];

            let vspfArgs: any = [];
            switch (gemCnd['comparator' + i]) {
              case 2:                         // requires less <color> than (<value> || <comparecolor>) gems
              case 5:                         // requires at least <color> than (<value> || <comparecolor>) gems
              vspfArgs = [
                gemCnd['value' + i],
                ITEM_CONSTANTS['gemColors'][gemCndColor - 1],
              ];
              break;
              case 3:                         // requires more <color> than (<value> || <comparecolor>) gems
                vspfArgs = [
                  ITEM_CONSTANTS['gemColors'][gemCndColor - 1],
                  ITEM_CONSTANTS['gemColors'][gemCndCmpColor - 1],
                ];
              break;
              default:
                break;
            }

            if (vspfArgs.length === 0) {
              continue;
            }

            const gemEnchText = gemConditions[gemCndComparator]
                                .replace('%s', vspfArgs[0] ?? '')
                                .replace('%s', vspfArgs[1] ?? '');

            gemEnchantmentText += `<br><span class="q0">Requires ${gemEnchText}</span>`;
          }
        }
      }
    }

    return gemEnchantmentText;
  }

  private async getSocketEnchantment(): Promise<string> {

    let socketText = '';

    // fill native sockets
    for (let j = 1; j <= 3; j++) {
      const socketColor = this.editorService.form.controls['socketColor_' + j].value;

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

    const socketBonus = this.editorService.form.controls.socketBonus.value;
    if (!!socketBonus) {
      const sbonus = await this.sqliteQueryService.getSocketBonusById(socketBonus);
      const socketBonusText = `${ITEM_CONSTANTS.socketBonus.replace('%s', sbonus)}`;
      socketText += `<br><span class="q0">${socketBonusText}</span>`;
    }

    return socketText;
  }

  private async getSpellDesc(green: string[]) {
    const spellId1 = this.editorService.form.controls.spellid_1.value;
    const spellId2 = this.editorService.form.controls.spellid_2.value;

    if (!this.canTeachSpell(spellId1, spellId2)) {
      const itemSpellsAndTrigger = [];
      for (let j = 1; j <= 5; j++) {
        const spellid = this.editorService.form.controls['spellid_' + j].value;

        if (spellid > 0) {
          let cooldown = this.editorService.form.controls['spellcooldown_' + j].value;
          const cooldownCategory = this.editorService.form.controls['spellcategory_' + j].value;

          if (cooldown < cooldownCategory) {
            cooldown = cooldownCategory;
          }

          cooldown = cooldown < 5000 ? '' : ` ( ${this.formatTime(cooldown)} cooldown)`;

          itemSpellsAndTrigger[spellid] = [this.editorService.form.controls['spelltrigger_' + j].value, cooldown];
        }
      }

      if (itemSpellsAndTrigger) {
        const spellIDs = Object.keys(itemSpellsAndTrigger);
        for (const spellID of spellIDs) {
          const spellTrigger = itemSpellsAndTrigger[spellID];
          const parsed = await this.sqliteQueryService.getSpellDescriptionById(spellID); // TODO: parseText correctly

          green.push(ITEM_CONSTANTS.trigger[spellTrigger[0]] + parsed + spellTrigger[1]);
        }

      }
    }
  }

  // TODO: recipes, vanity pets, mounts
  private async getLearnSpellText(): Promise<string> {
    /* TODO - WIP */

    let spellDesc = '';

    // const bagFamily: number = Number(this.editorService.form.controls.BagFamily.value);
    // const itemClass: number = Number(this.editorService.form.controls.class.value);
    const spellId1 = this.editorService.form.controls.spellid_1.value;
    const spellId2 = this.editorService.form.controls.spellid_2.value;

    if (this.canTeachSpell(spellId1, spellId2)) {
      const craftSpell = spellId2;


      if (!!craftSpell) {
        // let xCraft = '';

        const desc = await this.sqliteQueryService.getSpellDescriptionById(spellId2);

        if (!!desc) {
          spellDesc += `<br><span class="q2">${ITEM_CONSTANTS.trigger[0]} ${desc}</span>`;
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
  private async getLockText(): Promise<string> {
    let lockText = '';

    const flags = this.editorService.form.controls.Flags.value;
    const lockid = this.editorService.form.controls.lockid.value;
    if (!!lockid) {
      const lockData = await this.getLocks(lockid);

      if (!!lockData) {
        lockText += `<br><span class="q0">Locked${lockData.join('')}</span>`;
      } else if (flags & ITEM_FLAG.OPENABLE) {
        lockText += `<br><span class="q2">${ITEM_CONSTANTS.openClick}</span>`;
      }
    }

    return lockText;
  }

  public async calculatePreview(): Promise<string> {
    let tmpItemPreview = '';
    const green: string[] = [];

    const flags = this.editorService.form.controls.Flags.value;
    const bagFamily: number = Number(this.editorService.form.controls.BagFamily.value);
    const quality: number = Number(this.editorService.form.controls.Quality.value);

    // ITEM NAME
    const itemName = this.editorService.form.controls.name.value;
    if (itemName) {
      tmpItemPreview += '<b class="item-name q' + quality + '">' + itemName + '</b>';
    }

    // heroic tag
    if (flags & ITEM_FLAG.HEROIC && quality === ITEMS_QUALITY.EPIC) {
      tmpItemPreview += '<br><!-- ITEM_FLAG.HEROIC --><span class="q2">Heroic</span>';
    }

    tmpItemPreview += await this.getRequiredZone();

    // conjured
    if (flags & ITEM_FLAG.CONJURED) {
      tmpItemPreview += '<br> Conjured Item';
    }

    tmpItemPreview += await this.getBonding();
    tmpItemPreview += this.getDuration();

    // required holiday
    const holiday = this.editorService.form.controls.HolidayId.value;
    if (!!holiday) {
      const eventName = await this.sqliteQueryService.getEventNameByHolidayId(holiday);
      tmpItemPreview += `<br>Requires ${eventName}`;
    }

    // item begins a quest
    const startquest: number = Number(this.editorService.form.controls.startquest.value);
    if (startquest > 0) {
      tmpItemPreview += `<br><span class="q1">This Item Begins a Quest</span>`;
    }

    // containerType (slotCount)
    const containerSlots: number = Number(this.editorService.form.controls.ContainerSlots.value);
    if (containerSlots > 0) {
      const fam = bagFamily ? Math.log2(bagFamily) + 1 : 0;
      tmpItemPreview += `<br>${containerSlots} Slot ${ITEM_CONSTANTS.bagFamily[fam]}`;
    }

    tmpItemPreview += this.getClassText();
    tmpItemPreview += this.getDamageText();
    tmpItemPreview += this.getArmorText();

    // Item is a gem (don't mix with sockets)
    tmpItemPreview += await this.getGemEnchantment();

    // Random Enchantment - if random enchantment is set, prepend stats from it
    const RandomProperty: number = this.editorService.form.controls.RandomProperty.value;
    const RandomSuffix: number = this.editorService.form.controls.RandomSuffix.value;
    if (!!RandomProperty || RandomSuffix) {
      tmpItemPreview += `<br><span class="q2">${ITEM_CONSTANTS.randEnchant}</span>`;
    }

    // itemMods (display stats and save ratings for later use)
    tmpItemPreview += this.getStats(green);

    tmpItemPreview += this.getMagicResistances();

    // Socket & Enchantment (TODO)
    tmpItemPreview += await this.getSocketEnchantment();

    // durability
    const durability = this.editorService.form.controls.MaxDurability.value;
    if (durability) {
      tmpItemPreview += `<br>${ITEM_CONSTANTS.durability.replace(/%d/g, durability)}`;
    }

    tmpItemPreview += await this.getRequiredText();

    tmpItemPreview += await this.getLockText();

    // spells on item
    await this.getSpellDesc(green);

    if (!!green && green.length > 0) {
      for (const bonus of green) {
        if (bonus) {
          tmpItemPreview += `<br><span class="q2">${bonus}</span>`;
        }
      }
    }

    tmpItemPreview += await this.getItemSet();

    // recipes, vanity pets, mounts
    tmpItemPreview += await this.getLearnSpellText();

    tmpItemPreview += this.getMisc();

    const sellPrice = this.editorService.form.controls.SellPrice.value;
    if (!!sellPrice) {
      tmpItemPreview += '<br>Sell Price: ' + this.formatMoney(sellPrice);
    }

    return tmpItemPreview;
  }

}
