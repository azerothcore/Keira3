import { Injectable } from '@angular/core';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { ItemTemplateService } from './item-template.service';
import { SqliteQueryService } from '@keira-shared/services/sqlite-query.service';
import { ITEM_TYPE, ITEM_MOD } from '@keira-shared/constants/options/item-class';
import { ITEM_CONSTANTS } from './item_constants';
import { MAX_LEVEL, lvlIndepRating, gtCombatRatings, CLASSES, RACE, resistanceFields } from './item-utils';
import { ITEM_FLAG } from '@keira-shared/constants/flags/item-flags';
import { ITEMS_QUALITY } from '@keira-shared/constants/options/item-quality';

@Injectable()
export class ItemUtilsService {
  private readonly ITEM_CONSTANTS = ITEM_CONSTANTS;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: ItemTemplateService,
    public readonly sqliteQueryService: SqliteQueryService,
    protected queryService: MysqlQueryService,
  ) { }

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
    } else if (lvlIndepRating.includes[type]) { // level independant Bonus
      return ITEM_CONSTANTS.trigger[1] + ITEM_CONSTANTS.statType[type].replace('%d', `<!--rtg${type}-->${value}`);
    } else { // rating-Bonuses
      const js = `&nbsp;<small>(${this.setRatingLevel(level, type, value)})</small>`;
      return ITEM_CONSTANTS.trigger[1] + ITEM_CONSTANTS.statType[type].replace('%d', `<!--rtg${type}-->${value}${js}`);
    }
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
          tmp.push(tmpClass);
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

  public formatMoney(qty: number): string {
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
      'd': 0,
      'h': 0,
      'm': 0,
      's': 0,
      'ms': 0,
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

  public formatTime(base, short = false) {
    const s = this.parseTime(base / 1000);
    let tmp = 0;

    if (short) {
      if (tmp = Math.round(s.d / 364)) {
        return tmp + ' ' + ITEM_CONSTANTS.timeUnits.ab[0];
      }

      if (tmp = Math.round(s.d / 30)) {
        return tmp + ' ' + ITEM_CONSTANTS.timeUnits.ab[1];
      }
      if (tmp = Math.round(s.d / 7)) {
        return tmp + ' ' + ITEM_CONSTANTS.timeUnits.ab[2];
      }
      if (tmp = Math.round(s.d)) {
        return tmp + ' ' + ITEM_CONSTANTS.timeUnits.ab[3];
      }
      if (tmp = Math.round(s.h)) {
        return tmp + ' ' + ITEM_CONSTANTS.timeUnits.ab[4];
      }
      if (tmp = Math.round(s.m)) {
        return tmp + ' ' + ITEM_CONSTANTS.timeUnits.ab[5];
      }
      if (tmp = Math.round(s.s + s.ms / 1000)) {
        return tmp + ' ' + ITEM_CONSTANTS.timeUnits.ab[6];
      }
      if (s.ms) {
        return s.ms + ' ' + ITEM_CONSTANTS.timeUnits.ab[7];
      }

      return '0 ' + ITEM_CONSTANTS.timeUnits.ab[6];
    } else {
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
      if (s.d) {
        return Math.round(s.d + s.h  /   24) + ' ' + ITEM_CONSTANTS.timeUnits[s.d === 1 && !s.h  ? 'sg' : 'pl'][3];
      }
      if (s.h) {
        return Math.round(s.h + s.m  /   60) + ' ' + ITEM_CONSTANTS.timeUnits[s.h === 1 && !s.m  ? 'sg' : 'pl'][4];
      }
      if (s.m) {
        return Math.round(s.m + s.s  /   60) + ' ' + ITEM_CONSTANTS.timeUnits[s.m === 1 && !s.s  ? 'sg' : 'pl'][5];
      }
      if (s.s) {
        return Math.round(s.s + s.ms / 1000) + ' ' + ITEM_CONSTANTS.timeUnits[s.s === 1 && !s.ms ? 'sg' : 'pl'][6];
      }
      if (s.ms) {
        return s.ms + ' ' + ITEM_CONSTANTS.timeUnits[s.ms === 1 ? 'sg' : 'pl'][7];
      }

      return '0 ' + ITEM_CONSTANTS.timeUnits.pl[6];
    }
  }

  public getFeralAP(itemClass: number, subclass: number, dps: number): number {
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

  public canTeachSpell(spellId1: number, spellId2: number = null): boolean {
    // 483:   learn recipe;
    // 55884: learn mount/pet
    if (![483, 55884].includes(spellId1)) {
      return false;
    }

    // needs learnable spell
    return !!spellId2;
  }


  /**
   * get item preview text
   */

  public getDamageText(): string {
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
        damageText += `<table style="float: left;" width="100%"><tr><td>${dmg}</td><td>&nbsp;&nbsp;&nbsp;&nbsp;</td><th style="text-align: right;">Speed <!--spd-->${speed.toFixed(2)}</th></tr></table>`;
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

  public getStats(greenText: string[]): string {
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

  public getItemSet(): string {
    /* TODO */

    // // Item Set
    // const pieces  = [];
    // setId = this->getField('itemset')
    // if (itemSet) {
    // // while Ids can technically be used multiple times the only difference in data are the items used. So it doesn't matter what we get
    //   const itemset = new ItemsetList(array(['id', setId]));
    //   if (!itemset->error && itemset->pieceToSet) {
    //     pieces = select('
    //     SELECT b.id AS ARRAY_KEY, b.name_loc0, b.name_loc2, b.name_loc3, b.name_loc4, b.name_loc6, b.name_loc8,
    //     GROUP_CONCAT(a.id SEPARATOR \':\') AS equiv
    //     FROM   ?_items a, ?_items b
    //     WHERE  a.slotBak = b.slotBak AND a.itemset = b.itemset AND b.id IN (?a)
    //     GROUP BY b.id;',
    //     array_keys(itemset->pieceToSet)
    //     );

    //     foreach (pieces as k => &p)
    //     p = '<span><!--si'.p['equiv'].'--><a href="?item='.k.'">'.Util::localizedString(p, 'name').'</a></span>';

    //     xSet = '<br><span class="q">'.Lang::item('setName', ['<a href="?itemset='.itemset->id.'" class="q">'.
    //      itemset->getField('name', true).'</a>', 0, count(pieces)]).'</span>';

    //     if (skId = itemset->getField('skillId'))      // bonus requires skill to activate
    //     {
    //       xSet += '<br>'.sprintf(Lang::game('requires'), '<a href="?skills='.skId.'" class="q1">'.SkillList::getName(skId).'</a>');

    //       if (_ = itemset->getField('skillLevel'))
    //       xSet += ' ('._.')';

    //       xSet += '<br>';
    //     }

    //     // list pieces
    //     xSet += '<div class="q0 indent">'.implode('<br>', pieces).'</div><br>';

    //     // get bonuses
    //     setSpellsAndIdx = [];
    //     for (j = 1; j <= 8; j++)
    //     if (_ = itemset->getField('spell'.j))
    //     setSpellsAndIdx[_] = j;

    //     setSpells = [];
    //     if (setSpellsAndIdx)
    //     {
    //       boni = new SpellList(array(['s.id', array_keys(setSpellsAndIdx)]));
    //       foreach (boni->iterate() as __)
    //       {
    //         setSpells[] = array(
    //           'tooltip' => boni->parseText('description', _reqLvl > 1 ? _reqLvl : MAX_LEVEL, false, causesScaling)[0],
    //           'entry'   => itemset->getField('spell'.setSpellsAndIdx[boni->id]),
    //           'bonus'   => itemset->getField('bonus'.setSpellsAndIdx[boni->id])
    //           );
    //         }
    //       }

    //       // sort and list bonuses
    //       xSet += '<span class="q0">';
    //       for (i = 0; i < count(setSpells); i++)
    //       {
    //         for (j = i; j < count(setSpells); j++)
    //         {
    //           if (setSpells[j]['bonus'] >= setSpells[i]['bonus'])
    //           continue;
    //           tmp = setSpells[i];
    //           setSpells[i] = setSpells[j];
    //           setSpells[j] = tmp;
    //         }
    //         xSet += '<span>'.Lang::item('setBonus', [setSpells[i]['bonus'], '<a href="?spell='.
    //         setSpells[i]['entry'].'">'.setSpells[i]['tooltip'].'</a>']).'</span>';
    //         if (i < count(setSpells) - 1)
    //         xSet += '<br>';
    //       }
    //       xSet += '</span>';
    //     }
    //   }

    return '';
  }

  public getBonding(): string {
    let bondingText = '';

    const flags = this.editorService.form.controls.Flags.value;
    const bonding: number = Number(this.editorService.form.controls.bonding.value);
    const maxcount: number = Number(this.editorService.form.controls.maxcount.value);
    const bagFamily: number = Number(this.editorService.form.controls.BagFamily.value);
    // const itemLimitCategory = this.editorService.form.controls.ItemLimitCategory.value;

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
    } /* else if (itemLimitCategory) {
        $limit = selectRow("SELECT * FROM ?_itemlimitcategory WHERE id = ?", $this->curTpl['itemLimitCategory']);
        bondingText += '<br><!-- unique isGem -->'.sprintf(Lang::item($limit['isGem'] ? 'uniqueEquipped' : 'unique', 2),
          Util::localizedString($limit, 'name'), $limit['count']);
    } */

    return bondingText;
  }

  public getClassText(): string {
    let classText = '';

    const inventoryType: number = Number(this.editorService.form.controls.InventoryType.value);
    const itemClass: number = Number(this.editorService.form.controls.class.value);
    const subclass: number = Number(this.editorService.form.controls.subclass.value);

    let textRight = '';
    if ([ITEM_TYPE.ARMOR, ITEM_TYPE.WEAPON, ITEM_TYPE.AMMUNITION].includes(itemClass)) {
      classText += '<table style="float: left;" width="100%"><tr>';

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

  public getArmorText(): string {
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

  public async getRequiredText(): Promise<string> {
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

    // required CityRank (TODO?)

    // required level
    if ((flags & ITEM_FLAG.ACCOUNTBOUND) && quality === ITEMS_QUALITY.HEIRLOOM) {

      requiredText += '<br>' + ITEM_CONSTANTS.reqLevelRange
        .replace('%d', '1')
        .replace('%d', MAX_LEVEL.toString())
        .replace('%s', MAX_LEVEL.toString());

    } else if (requiredLevel > 1) {
      requiredText += '<br>' + ITEM_CONSTANTS.reqMinLevel.replace('%d', requiredLevel);
    }

    // TODO
    // required arena team rating / personal rating / todo (low): sort out what kind of rating
    // if (!empty($this->getExtendedCost([], $reqRating)[$this->id]) && $reqRating) {
    //   requiredText += sprintf(Lang::item('reqRating', $reqRating[1]), $reqRating[0]).'<br>';
    // }

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

  public async getRequiredZone(): Promise<string> {
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

  public getDuration(): string {
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

  public getMagicResistances(): string {
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

  public getMisc(xMisc: string[]): void {
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
        console.log(charges);
        xMisc.push(`<br><span class="q1">${charges}</span>`);
      }
    }
  }

  // TODO
  public getGemEnchantment(): string {
    // const gemEnchantmentId = this.editorService.form.controls.gemEnchantmentId.value;
    // if (gemEnchantmentId) {
    //   gemEnch = selectRow('SELECT * FROM ?_itemenchantment WHERE id = ?d', geId);
    //   this.tmpItemPreview += '<span class="q1"><a href="?enchantment='.geId.'">'.
    //   Util:: localizedString(gemEnch, 'name').'</a></span><br>';

    //   // activation conditions for meta gems
    //   if (!empty(gemEnch['conditionId'])) {
    //     if (gemCnd = selectRow('SELECT * FROM ?_itemenchantmentcondition WHERE id = ?d', gemEnch['conditionId'])) {
    //       for (let i = 1; i < 6; i++) {
    //         if (!gemCnd['color'.i]) {
    //           continue;
    //         }

    //         vspfArgs = [];
    //         switch (gemCnd['comparator'.i]) {
    //           case 2:                         // requires less <color> than (<value> || <comparecolor>) gems
    //           case 5:                         // requires at least <color> than (<value> || <comparecolor>) gems
    //           vspfArgs = [gemCnd['value'.i], Lang:: item('gemColors', gemCnd['color'.i] - 1)];
    //           break;
    //           case 3:                         // requires more <color> than (<value> || <comparecolor>) gems
    //           vspfArgs = [Lang:: item('gemColors', gemCnd['color'.i] - 1),
    //           Lang:: item('gemColors', gemCnd['cmpColor'.i] - 1)];
    //           break;
    //           default:
    //           continue;
    //         }

    //         this.tmpItemPreview += '<span class="q0">'.Lang:: achievement('reqNumCrt').' '.
    //         Lang:: item('gemConditions', gemCnd['comparator'.i], vspfArgs).'</span><br>';
    //       }
    //     }
    //   }
    // }
    return '';
  }

  // TODO
  public getSocketEnchantment(): string {
    // // Enchantment
    // if (isset($enhance['e']))
    // {
    //     if ($enchText = selectRow('SELECT * FROM ?_itemenchantment WHERE Id = ?', $enhance['e']))
    //         this.tmpItemPreview += '<span class="q2"><!--e-->'.Util::localizedString($enchText, 'name').'</span><br>';
    //     else
    //     {
    //         unset($enhance['e']);
    //         this.tmpItemPreview += '<!--e-->';
    //     }
    // }
    // else                                                // enchantment placeholder
    //     this.tmpItemPreview += '<!--e-->';

    // // Sockets w/ Gems
    // if (!empty($enhance['g']))
    // {
    //     $gems = select('
    //         SELECT it.id AS ARRAY_KEY, ic.name AS iconString, ae.*, it.gemColorMask AS colorMask
    //         FROM   ?_items it
    //         JOIN   ?_itemenchantment ae ON ae.id = it.gemEnchantmentId
    //         JOIN   ?_icons ic ON ic.id = it.iconId
    //         WHERE  it.id IN (?a)',
    //         $enhance['g']);
    //     foreach ($enhance['g'] as $k => $v)
    //         if ($v && !in_array($v, array_keys($gems))) // 0 is valid
    //             unset($enhance['g'][$k]);
    // }
    // else
    //     $enhance['g'] = [];

    // // zero fill empty sockets
    // $sockCount = isset($enhance['s']) ? 1 : 0;
    // if (!empty($this->json[$this->id]['nsockets']))
    //     $sockCount += $this->json[$this->id]['nsockets'];

    // while ($sockCount > count($enhance['g']))
    //     $enhance['g'][] = 0;

    // $enhance['g'] = array_reverse($enhance['g']);

    // $hasMatch = 1;
    // // fill native sockets
    // for ($j = 1; $j <= 3; $j++)
    // {
    //     if (!$this->curTpl['socketColor'.$j])
    //         continue;

    //     for ($i = 0; $i < 4; $i++)
    //         if (($this->curTpl['socketColor'.$j] & (1 << $i)))
    //             $colorId = $i;

    //     $pop       = array_pop($enhance['g']);
    //     $col       = $pop ? 1 : 0;
    //     $hasMatch &= $pop ? (($gems[$pop]['colorMask'] & (1 << $colorId)) ? 1 : 0) : 0;
    //     $icon      = $pop ? sprintf(Util::$bgImagePath['tiny'], STATIC_URL, strtolower($gems[$pop]['iconString'])) : null;
    //     $text      = $pop ? Util::localizedString($gems[$pop], 'name') : Lang::item('socket', $colorId);

    //     if ($interactive)
    //         this.tmpItemPreview += '<a href="?items=3&amp;filter=cr=81;crs='
    //         .($colorId + 1).';crv=0" class="socket-'.Game::$sockets[$colorId].' q'.$col.'" '.$icon.'>'.$text.'</a><br>';
    //     else
    //         this.tmpItemPreview += '<span class="socket-'.Game::$sockets[$colorId].' q'.$col.'" '.$icon.'>'.$text.'</span><br>';
    // }

    // // fill extra socket
    // if (isset($enhance['s']))
    // {
    //     $pop  = array_pop($enhance['g']);
    //     $col  = $pop ? 1 : 0;
    //     $icon = $pop ? sprintf(Util::$bgImagePath['tiny'], STATIC_URL, strtolower($gems[$pop]['iconString'])) : null;
    //     $text = $pop ? Util::localizedString($gems[$pop], 'name') : Lang::item('socket', -1);

    //     if ($interactive)
    //         this.tmpItemPreview += '<a href="?items=3&amp;filter=cr=81;crs=5;crv=0"
    //         class="socket-prismatic q'.$col.'" '.$icon.'>'.$text.'</a><br>';
    //     else
    //         this.tmpItemPreview += '<span class="socket-prismatic q'.$col.'" '.$icon.'>'.$text.'</span><br>';
    // }
    // else                                                // prismatic socket placeholder
    //     this.tmpItemPreview += '<!--ps-->';

    // if ($_ = $this->curTpl['socketBonus'])
    // {
    //     $sbonus = selectRow('SELECT * FROM ?_itemenchantment WHERE Id = ?d', $_);
    //     this.tmpItemPreview += '<span class="q'.($hasMatch ? '2' : '0').'">'
    //     .Lang::item('socketBonus', ['<a href="?enchantment='.$_.'">'.Util::localizedString($sbonus, 'name').'</a>']).'</span><br>';
    // }

    return '';
  }

  public async getSpellDesc(green: string[]) {
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
  public async getLearnSpellText(): Promise<string> {
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
        name = await this.queryService.getItemNameById(prop);

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

      // locks[lockType === 1 ? prop : -prop] = `Requires ${name}`;
      locks.push(`<br>Requires ${name}`);
    }

    return locks;
  }

  // locked or openable
  public async getLockText(): Promise<string> {
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
}
