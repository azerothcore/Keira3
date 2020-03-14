import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SingleRowEditorComponent } from '@keira-abstract/components/editors/single-row-editor.component';
import { ALLOWABLE_CLASSES } from '@keira-constants/flags/allowable-classes';
import { ALLOWABLE_RACES } from '@keira-constants/flags/allowable-races';
import { BAG_FAMILY } from '@keira-constants/flags/bag-family';
import { ITEM_FLAG, ITEM_FLAGS } from '@keira-constants/flags/item-flags';
import { ITEM_FLAGS_CUSTOM } from '@keira-constants/flags/item-flags-custom';
import { ITEM_FLAGS_EXTRA } from '@keira-constants/flags/item-flags-extra';
import { SOCKET_COLOR } from '@keira-constants/flags/socket-color';
import { DAMAGE_TYPE } from '@keira-constants/options/damage-type';
import { FACTIONS } from '@keira-constants/options/faction';
import { FACTION_RANK } from '@keira-constants/options/faction-rank';
import { FOOD_TYPE } from '@keira-constants/options/foot-type';
import { INVENTORY_TYPE } from '@keira-constants/options/inventory-type';
import { ITEM_BONDING } from '@keira-constants/options/item-bonding';
import { ITEM_CLASS, ITEM_MOD, ITEM_SUBCLASS, ITEM_TYPE } from '@keira-constants/options/item-class';
import { ITEM_MATERIAL } from '@keira-constants/options/item-material';
import { ITEMS_QUALITY, ITEM_QUALITY } from '@keira-constants/options/item-quality';
import { ITEM_SHEAT } from '@keira-constants/options/item-sheath';
import { SOCKET_BONUS } from '@keira-constants/options/socket-bonus';
import { STAT_TYPE } from '@keira-constants/options/stat-type';
import { TOTEM_CATEGORY } from '@keira-constants/options/totem-category';
import { SqliteQueryService } from '@keira-shared/services/sqlite-query.service';
import { ItemTemplate } from '@keira-types/item-template.type';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ItemHandlerService } from '../item-handler.service';
import { AOWOW_ITEM, formatTime, getFeralAP, getRaceString, getRequiredClass, MAX_LEVEL, parseRating, resistanceFields, formatMoney } from './aowow';
import { ItemTemplateService } from './item-template.service';

@Component({
  selector: 'app-item-template',
  templateUrl: './item-template.component.html',
  styleUrls: ['./item-template.component.scss']
})
export class ItemTemplateComponent extends SingleRowEditorComponent<ItemTemplate> implements OnInit {

  public readonly ITEM_CLASS = ITEM_CLASS;
  public readonly ITEM_SUBCLASS = ITEM_SUBCLASS;
  public readonly ITEM_QUALITY = ITEM_QUALITY;
  public readonly ITEM_FLAGS = ITEM_FLAGS;
  public readonly ITEM_FLAGS_EXTRA = ITEM_FLAGS_EXTRA;
  public readonly INVENTORY_TYPE = INVENTORY_TYPE;
  public readonly ALLOWABLE_CLASSES = ALLOWABLE_CLASSES;
  public readonly ALLOWABLE_RACES = ALLOWABLE_RACES;
  public readonly FACTION_RANK = FACTION_RANK;
  public readonly BAG_FAMILY = BAG_FAMILY;
  public readonly SOCKET_COLOR = SOCKET_COLOR;
  public readonly ITEM_BONDING = ITEM_BONDING;
  public readonly ITEM_MATERIAL = ITEM_MATERIAL;
  public readonly ITEM_SHEAT = ITEM_SHEAT;
  public readonly TOTEM_CATEGORY = TOTEM_CATEGORY;
  public readonly FOOD_TYPE = FOOD_TYPE;
  public readonly ITEM_FLAGS_CUSTOM = ITEM_FLAGS_CUSTOM;
  public readonly DAMAGE_TYPE = DAMAGE_TYPE;
  public readonly SOCKET_BONUS = SOCKET_BONUS;
  public readonly FACTIONS = FACTIONS;
  public readonly STAT_TYPE = STAT_TYPE;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: ItemTemplateService,
    public handlerService: ItemHandlerService,
    public readonly sqliteQueryService: SqliteQueryService,
    private sanitizer: DomSanitizer,
  ) {
    super(editorService, handlerService);
  }

  public readonly AOWOW_ITEM = AOWOW_ITEM;
  public icon: Promise<string>;
  public hasItemLevel: boolean = false;
  public itemPreview: SafeHtml = this.sanitizer.bypassSecurityTrustHtml('loading...');
  private tmpItemPreview = '';

  private async calculatePreview() {
    this.tmpItemPreview = '';

    const green = [];

    const flags = Math.log2(this.editorService.form.controls.Flags.value);
    const bonding: number = Number(this.editorService.form.controls.bonding.value);
    const maxcount: number = Number(this.editorService.form.controls.maxcount.value);
    const bagFamily: number = Number(this.editorService.form.controls.BagFamily.value);
    const quality: number = Number(this.editorService.form.controls.Quality.value);
    // const itemLimitCategory = this.editorService.form.controls.ItemLimitCategory.value;

    // ITEM NAME
    const itemName = this.editorService.form.controls.name.value;
    if (itemName) {
      this.tmpItemPreview += '<b class="item-name q' + quality + '">' + itemName + '</b>';
    }

    // heroic tag
    if (flags === ITEM_FLAG.HEROIC && quality === ITEMS_QUALITY.EPIC) {
      this.tmpItemPreview += '<br><span class="q2">Heroic</span>';
    }

    // REQUIRE MAP
    // requires map (todo: reparse ?_zones for non-conflicting data; generate Link to zone)
    // if ($_ = $this->curTpl['map'])
    // {
    //     $map = DB::Aowow()->selectRow('SELECT * FROM ?_zones WHERE mapId = ?d LIMIT 1', $_);
    //     H '<br><a href="?zone='.$_.'" class="q1">'.Util::localizedString($map, 'name').'</a>';
    // }

    // REQUIRE AREA
    // requires area
    // if ($this->curTpl['area'])
    // {
    //     $area = DB::Aowow()->selectRow('SELECT * FROM ?_zones WHERE Id=?d LIMIT 1', $this->curTpl['area']);
    //     this.tmpItemPreview += '<br>'.Util::localizedString($area, 'name');
    // }

    // conjured
    if (flags === ITEM_FLAG.CONJURED) {
      this.tmpItemPreview += '<br> Conjured Item';
    }

    // bonding
    if (flags === ITEM_FLAG.ACCOUNTBOUND) {
      this.tmpItemPreview += '<br>' + this.AOWOW_ITEM.bonding[0];
    } else if (bonding) {
      this.tmpItemPreview += '<br>' + this.AOWOW_ITEM.bonding[bonding];
    }

    // unique || unique-equipped || unique-limited
    if (maxcount === 1) {
      this.tmpItemPreview += '<br>' + this.AOWOW_ITEM['unique'][0];
    } else if (maxcount && bagFamily !== 8192) { // not for currency tokens
      this.tmpItemPreview += '<br>' + this.AOWOW_ITEM['unique'][1].replace('%d', maxcount.toString());
    } else if (flags === ITEM_FLAG.UNIQUEEQUIPPED) {
      this.tmpItemPreview += '<br>' + this.AOWOW_ITEM['uniqueEquipped'][0];
    } /* else if (itemLimitCategory) {
        $limit = DB::Aowow()->selectRow("SELECT * FROM ?_itemlimitcategory WHERE id = ?", $this->curTpl['itemLimitCategory']);
        this.tmpItemPreview += '<br>'.sprintf(Lang::item($limit['isGem'] ? 'uniqueEquipped' : 'unique', 2),
          Util::localizedString($limit, 'name'), $limit['count']);
    } */

    // max duration
    const duration = Math.abs(this.editorService.form.controls.duration.value);
    // const flagsCustom = this.editorService.form.controls.flagsCustom.value;
    if (duration) {
      /*    let rt = '';
            if (flagsCustom & 0x1) {
              rt = $interactive
                ? ' ('.sprintf(Util::$dfnString, 'LANG.tooltip_realduration', Lang::item('realTime')).')'
                : ' ('.Lang::item('realTime').')';
            }
       */
      this.tmpItemPreview += '<br>Duration' + ': ' + formatTime(duration * 1000) /* + rt */;
    }

    // // required holiday
    // if ($eId = $this->curTpl['eventId'])
    //   if ($hName = DB::Aowow()->selectRow('SELECT h.* FROM ?_holidays h JOIN ?_events e ON e.holidayId = h.id WHERE e.id = ?d', $eId))
    //     this.tmpItemPreview += '<br>'.sprintf(Lang::game('requires'), '<a href="'.$eId.'" class="q1">
    //     '.Util::localizedString($hName, 'name').'</a>');

    // item begins a quest
    const startquest: number = Number(this.editorService.form.controls.startquest.value);
    if (startquest > 0) {
      this.tmpItemPreview += `<br><a class="q1" href="?quest=${startquest}">This Item Begins a Quest</a>`;
    }

    // containerType (slotCount)
    const containerSlots: number = Number(this.editorService.form.controls.ContainerSlots.value);
    const inventoryType: number = Number(this.editorService.form.controls.InventoryType.value);
    if (containerSlots > 0) {
      const fam = bagFamily ? Math.log2(bagFamily) + 1 : 0;
      this.tmpItemPreview += `<br>${containerSlots} Slot ${AOWOW_ITEM.bagFamily[fam]}`;
    }

    const itemClass: number = Number(this.editorService.form.controls.class.value);
    const subclass: number = Number(this.editorService.form.controls.subclass.value);
    let textRight = '';
    if ([ITEM_TYPE.ARMOR, ITEM_TYPE.WEAPON, ITEM_TYPE.AMMUNITION].includes(itemClass)) {
      this.tmpItemPreview += '<table width="100%"><tr>';

      // Class
      if (inventoryType) {
        this.tmpItemPreview += `<td>${AOWOW_ITEM.inventoryType[inventoryType]}</td>`;
        textRight = 'style="text-align: right;"';
      }

      // Subclass
      if (itemClass === ITEM_TYPE.ARMOR && subclass > 0) {
        this.tmpItemPreview += `<th ${textRight}><!--asc ${subclass} -->${AOWOW_ITEM.armorSubClass[subclass]}</th>`;
      } else if (itemClass === ITEM_TYPE.WEAPON) {
        this.tmpItemPreview += `<th ${textRight}>${AOWOW_ITEM.weaponSubClass[subclass]}</th>`;
      } else if (itemClass === ITEM_TYPE.AMMUNITION) {
        this.tmpItemPreview += `<th ${textRight}>${AOWOW_ITEM.projectileSubClass[subclass]}</th>`;
      }

      this.tmpItemPreview += '</tr></table>';

      // yes, inventoryType/slot can occur on random items and is then also displayed <_< .. excluding Bags >_>
    } else if (inventoryType && itemClass !== ITEM_TYPE.CONTAINER) {
      this.tmpItemPreview += `<br>${AOWOW_ITEM.inventoryType[subclass]}<br>`;
    } else {
      this.tmpItemPreview += '<br>';
    }

    // Weapon/Ammunition Stats                          (not limited to weapons (see item:1700))
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

    let dmg = '';

    if (itemClass === ITEM_TYPE.AMMUNITION && dmgmin && dmgmax) {
      if (sc1) {
        this.tmpItemPreview += AOWOW_ITEM.damage.ammo[1].replace('%d', ((dmgmin + dmgmax) / 2).toString()) + AOWOW_ITEM.sc[sc1] + '<br>';
      } else {
        this.tmpItemPreview += AOWOW_ITEM.damage.ammo[0].replace('%d', ((dmgmin + dmgmax) / 2).toString()) + '<br>';
      }
    } else if (dps) {
      if (dmgmin1 === dmgmax1) {
        dmg = AOWOW_ITEM.damage.single[sc1 ? 1 : 0]
          .replace('%g', dmgmin1)
          .replace('%s', (sc1 ? AOWOW_ITEM.sc[sc1] : ''))
          + '<br>';
      } else {
        dmg = AOWOW_ITEM.damage.range[sc1 ? 1 : 0]
          .replace('%d', dmgmin1)
          .replace('%d', dmgmax1)
          .replace('%s', sc1 ? AOWOW_ITEM.sc[sc1] : '')
          + '<br>';
      }

      if (itemClass === ITEM_TYPE.WEAPON) {
        this.tmpItemPreview += `<table width="100%"><tr><td>${dmg}</td><td>&nbsp;&nbsp;&nbsp;&nbsp;</td><th style="text-align: right;">Speed <!--spd-->${speed.toFixed(2)}</th></tr></table>`;
      } else {
        this.tmpItemPreview += `<!--dmg-->${dmg}<br>`;
      }

      // secondary damage is set
      if ((dmgmin2 || dmgmax2) && dmgmin2 !== dmgmax2) {
        this.tmpItemPreview += AOWOW_ITEM.damage.range[sc2 ? 3 : 2]
          .replace('%d', dmgmin2)
          .replace('%d', dmgmax2)
          .replace('%s', sc2 ? AOWOW_ITEM.sc[sc2] : '')
          + '<br>';
      } else if (dmgmin2) {
        this.tmpItemPreview += AOWOW_ITEM.damage.single[sc2 ? 3 : 2]
          .replace('%d', dmgmin2)
          .replace('%s', sc2 ? AOWOW_ITEM.sc[sc2] : '')
          + '<br>';
      }

      if (itemClass === ITEM_TYPE.WEAPON) {
        this.tmpItemPreview += `<!--dps-->${AOWOW_ITEM.dps.replace('%.1f', dps.toFixed(2))}<br>`;
      }

      // display FeralAttackPower if set
      const fap = getFeralAP(itemClass, subclass, dps);
      if (fap) {
        this.tmpItemPreview += `<span class="c11"><!--fap-->(${fap} ${AOWOW_ITEM.fap})</span><br>`;
      }
    }

    // Armor
    const armorDamageModifier = this.editorService.form.controls.ArmorDamageModifier.value;
    const armor = this.editorService.form.controls.armor.value;
    if (itemClass === ITEM_TYPE.ARMOR && armorDamageModifier > 0) {
      this.tmpItemPreview += `<span class="q2"><!--addamr${armorDamageModifier}--><span>${AOWOW_ITEM.armor.replace('%s', armor)}</span></span><br>`;
    } else if (armor) {
      this.tmpItemPreview += `<span><!--amr-->${AOWOW_ITEM.armor.replace('%s', armor)}</span><br>`;
    }

    // Block (note: block value from field block and from field stats or parsed from itemSpells are displayed independently)
    const block = this.editorService.form.controls.block.value;
    if (block) {
      this.tmpItemPreview += `<span>${AOWOW_ITEM.block.replace('%s', block)}</span><br>`;
    }

  // // Item is a gem (don't mix with sockets)
  // const gemEnchantmentId = this.editorService.form.controls.gemEnchantmentId.value;
  // if (gemEnchantmentId) {
  //   gemEnch = DB:: Aowow() -> selectRow('SELECT * FROM ?_itemenchantment WHERE id = ?d', geId);
  //   this.tmpItemPreview += '<span class="q1"><a href="?enchantment='.geId.'">'.
  //   Util:: localizedString(gemEnch, 'name').'</a></span><br>';

  //   // activation conditions for meta gems
  //   if (!empty(gemEnch['conditionId'])) {
  //     if (gemCnd = DB:: Aowow() -> selectRow('SELECT * FROM ?_itemenchantmentcondition WHERE id = ?d', gemEnch['conditionId'])) {
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


    // Random Enchantment - if random enchantment is set, prepend stats from it
    const RandomProperty: number = this.editorService.form.controls.RandomProperty.value;
    if (RandomProperty /* && empty($enhance['r']) */) {
      this.tmpItemPreview += `<span class="q2">${AOWOW_ITEM.randEnchant}</span><br>`;
    }/* else if (!empty($enhance['r'])) {
      this.tmpItemPreview += $randEnchant;
    } */

    // itemMods (display stats and save ratings for later use)
    const requiredLevel = this.editorService.form.controls.RequiredLevel.value;
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
        // $type += 1;                          // i think i fucked up somewhere mapping item_mods: offsets may be required somewhere
        case ITEM_MOD.AGILITY:
        case ITEM_MOD.STRENGTH:
        case ITEM_MOD.INTELLECT:
        case ITEM_MOD.SPIRIT:
        case ITEM_MOD.STAMINA:
          this.tmpItemPreview += `<span><!--stat${type}-->${(qty > 0 ? '+' : '-') + Math.abs(qty)} ${AOWOW_ITEM.statType[type]}</span><br>`;
          break;
        default:                                    // rating with % for reqLevel
          green.push(parseRating(type, qty, requiredLevel, /* interactive */ false, /* causesScaling */ false));
      }
    }

    // magic resistances
    resistanceFields.forEach((rowName, idx) => {
      const resField = this.editorService.form.controls[rowName + '_res'].value;
      if (rowName != null && resField != null && resField !== 0) {
        this.tmpItemPreview += `+${resField} ${AOWOW_ITEM.resistances[idx]} <br>`;
      }
    });

    // // Enchantment
    // if (isset($enhance['e']))
    // {
    //     if ($enchText = DB::Aowow()->selectRow('SELECT * FROM ?_itemenchantment WHERE Id = ?', $enhance['e']))
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
    //     $gems = DB::Aowow()->select('
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
    //         this.tmpItemPreview += '<a href="?items=3&amp;filter=cr=81;crs='.($colorId + 1).';crv=0" class="socket-'.Game::$sockets[$colorId].' q'.$col.'" '.$icon.'>'.$text.'</a><br>';
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
    //         this.tmpItemPreview += '<a href="?items=3&amp;filter=cr=81;crs=5;crv=0" class="socket-prismatic q'.$col.'" '.$icon.'>'.$text.'</a><br>';
    //     else
    //         this.tmpItemPreview += '<span class="socket-prismatic q'.$col.'" '.$icon.'>'.$text.'</span><br>';
    // }
    // else                                                // prismatic socket placeholder
    //     this.tmpItemPreview += '<!--ps-->';

    // if ($_ = $this->curTpl['socketBonus'])
    // {
    //     $sbonus = DB::Aowow()->selectRow('SELECT * FROM ?_itemenchantment WHERE Id = ?d', $_);
    //     this.tmpItemPreview += '<span class="q'.($hasMatch ? '2' : '0').'">'.Lang::item('socketBonus', ['<a href="?enchantment='.$_.'">'.Util::localizedString($sbonus, 'name').'</a>']).'</span><br>';
    // }

    // durability
    const durability = this.editorService.form.controls.MaxDurability.value;
    if (durability) {
      this.tmpItemPreview += `${AOWOW_ITEM.durability.replace(/%d/g, durability)}<br>`;
    }

    // required classes
    const allowableClasses = this.editorService.form.controls.AllowableClass.value;
    const classes = getRequiredClass(allowableClasses);
    if (classes != null && classes.length > 0) {
      this.tmpItemPreview += `Classes: ${classes.join(', ')}<br>`;
    }

    // required races
    const allowableRaces = this.editorService.form.controls.AllowableRace.value;
    const races = getRaceString(allowableRaces);
    if (races) {
      this.tmpItemPreview += `Races: ${races.join(', ')}<br>`;
    }

    // required honorRank (not used anymore)
    const requiredhonorrank = this.editorService.form.controls.requiredhonorrank.value;
    if (requiredhonorrank) {
      this.tmpItemPreview += `Requires ${AOWOW_ITEM.pvpRank[requiredhonorrank]}<br>`;
    }

    // required CityRank..?

    // required level
    if ((flags & ITEM_FLAG.ACCOUNTBOUND) && quality === ITEMS_QUALITY.HEIRLOOM) {

      this.tmpItemPreview += AOWOW_ITEM.reqLevelRange
        .replace('%d', '1')
        .replace('%d', MAX_LEVEL.toString())
        .replace('%s', MAX_LEVEL.toString()) + '<br>';

    } else if (requiredLevel > 1) {
      this.tmpItemPreview += AOWOW_ITEM.reqMinLevel.replace('%d', requiredLevel) + '<br>';
    }

    // required arena team rating / personal rating / todo (low): sort out what kind of rating
    // if (!empty($this->getExtendedCost([], $reqRating)[$this->id]) && $reqRating) {
    //   this.tmpItemPreview += sprintf(Lang::item('reqRating', $reqRating[1]), $reqRating[0]).'<br>';
    // }

    // item level
    const itemLevel = this.editorService.form.controls.ItemLevel.value;
    if (itemLevel > 0 && [ITEM_TYPE.ARMOR, ITEM_TYPE.WEAPON].includes(itemClass)) {
      this.tmpItemPreview += `${AOWOW_ITEM.itemLevel.replace('%d', itemLevel)} <br>`;
    }

    // TODO: fix this
    // required skill
    const requiredSkill = this.editorService.form.controls.RequiredSkill.value;
    const requiredSkillRank = this.editorService.form.controls.RequiredSkillRank.value;
    if (requiredSkill > 0) {
      let reqSkill = await this.sqliteQueryService.getSkillNameById(requiredSkill);
      if (requiredSkillRank > 0) {
        reqSkill += ` (${requiredSkillRank})`;
      }

      this.tmpItemPreview += `Requires: ${reqSkill}<br>`;
    }

    // required spell
    const requiredSpell = this.editorService.form.controls.requiredspell.value;
    if (requiredSpell > 0) {
      this.tmpItemPreview += `Requires <span class="q1">${await this.sqliteQueryService.getSpellNameById(requiredSpell)}</span><br>`;
    }

    // required reputation w/ faction
    const requiredFaction = this.editorService.form.controls.RequiredReputationFaction.value;
    const requiredFactionRank = this.editorService.form.controls.RequiredReputationRank.value;
    if (requiredFaction > 0) {
      let reqFaction = await this.sqliteQueryService.getFactionNameById(requiredFaction);
      if (requiredFactionRank > 0) {
        reqFaction += ` (${requiredFactionRank})`;
      }
      this.tmpItemPreview += `Requires ${reqFaction}<br>`;
    }

    // TODO: fix this
    // // locked or openable
    // const lockid = this.editorService.form.controls.lockid.value;
    // // const lockData = await this.sqliteQueryService.getLockById(lockid, this.editorService.queryService);
    // const lockData = false;
    // if (lockid > 0 && lockData) {
    //   // this.tmpItemPreview += `<span class="q0">Locked<br>${lockData.join('<br>')}</span><br>`;
    // } else if (flags & ITEM_FLAG.OPENABLE) {
    //   this.tmpItemPreview += `<span class="q2">${AOWOW_ITEM.openClick}</span><br>`;
    // }

    // // spells on item
    // const spellId1 = this.editorService.form.controls.spellid_1.value;
    // const spellId2 = this.editorService.form.controls.spellid_2.value;
    // if (!canTeachSpell(spellId1, spellId2)) {
    //   const itemSpellsAndTrigger = [];
    //   for (let j = 1; j <= 5; j++) {
    //     const spellid = this.editorService.form.controls['spellId' + j].value;

    //     if (spellid > 0) {
    //       let cd = this.editorService.form.controls['spellCooldown' + j].value;
    //       const cdCategory = this.editorService.form.controls['spellCategoryCooldown' + j].value;

    //       if (cd < cdCategory) {
    //         cd = cdCategory;
    //       }

    //       cd = cd < 5000 ? '' : ` ( ${formatTime(cd)} cooldown)`;

    //       itemSpellsAndTrigger[spellid] = [this.editorService.form.controls['spellTrigger' + j].value, cd];
    //     }
    //   }

    //   if (itemSpellsAndTrigger) {
    //     let cooldown = '';

    //     let itemSpells = new SpellList(array(['s.id', array_keys(itemSpellsAndTrigger)]));
    //     foreach (itemSpells->iterate() as __) {
    //       if (parsed = itemSpells->parseText('description', _reqLvl > 1 ? _reqLvl : MAX_LEVEL, false, false)[0]) {

    //         green[] = Lang::item('trigger', itemSpellsAndTrigger[itemSpells->id][0]).parsed.itemSpellsAndTrigger[itemSpells->id][1];

    //       }
    //     }
    //   }
    // }

    if (green && green.length > 0) {
      for (const bonus of green) {
        if (bonus) {
          this.tmpItemPreview += `<span class="q2">${bonus}</span><br>`;
        }
      }

      const lastBr = this.tmpItemPreview.lastIndexOf('<br>');
      this.tmpItemPreview = this.tmpItemPreview.substring(0, lastBr);
    }

  // // Item Set
  // const pieces  = [];
  // setId = this->getField('itemset')
  // if (itemSet) {
  //   // while Ids can technically be used multiple times the only difference in data are the items used. So it doesn't matter what we get
  //   const itemset = new ItemsetList(array(['id', setId]));
  //   if (!itemset->error && itemset->pieceToSet) {
  //     pieces = DB::Aowow()->select('
  //     SELECT b.id AS ARRAY_KEY, b.name_loc0, b.name_loc2, b.name_loc3, b.name_loc4, b.name_loc6, b.name_loc8, GROUP_CONCAT(a.id SEPARATOR \':\') AS equiv
  //     FROM   ?_items a, ?_items b
  //     WHERE  a.slotBak = b.slotBak AND a.itemset = b.itemset AND b.id IN (?a)
  //     GROUP BY b.id;',
  //     array_keys(itemset->pieceToSet)
  //     );

  //     foreach (pieces as k => &p)
  //     p = '<span><!--si'.p['equiv'].'--><a href="?item='.k.'">'.Util::localizedString(p, 'name').'</a></span>';

  //     xSet = '<br><span class="q">'.Lang::item('setName', ['<a href="?itemset='.itemset->id.'" class="q">'.itemset->getField('name', true).'</a>', 0, count(pieces)]).'</span>';

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
  //         xSet += '<span>'.Lang::item('setBonus', [setSpells[i]['bonus'], '<a href="?spell='.setSpells[i]['entry'].'">'.setSpells[i]['tooltip'].'</a>']).'</span>';
  //         if (i < count(setSpells) - 1)
  //         xSet += '<br>';
  //       }
  //       xSet += '</span>';
  //     }
  //   }

    // // recipes, vanity pets, mounts
    // if ($this->canTeachSpell())
    // {
    //     $craftSpell = new SpellList(array(['s.id', intVal($this->curTpl['spellId2'])]));
    //     if (!$craftSpell->error)
    //     {
    //         $xCraft = '';
    //         if ($desc = $this->getField('description', true))
    //             this.tmpItemPreview += '<span class="q2">'.Lang::item('trigger', 0).' <a href="?spell='.$this->curTpl['spellId2'].'">'.$desc.'</a></span><br>';

    //         // recipe handling (some stray Techniques have subclass == 0), place at bottom of tooltipp
    //         if (itemClass == ITEM_CLASS_RECIPE || $this->curTpl['bagFamily'] == 16)
    //         {
    //             $craftItem  = new ItemList(array(['i.id', (int)$craftSpell->curTpl['effect1CreateItemId']]));
    //             if (!$craftItem->error)
    //             {
    //                 if ($itemTT = $craftItem->renderTooltip($interactive, $this->id))
    //                     $xCraft .= '<div><br>'.$itemTT.'</div>';

    //                 $reagentItems = [];
    //                 for ($i = 1; $i <= 8; $i++)
    //                     if ($rId = $craftSpell->getField('reagent'.$i))
    //                         $reagentItems[$rId] = $craftSpell->getField('reagentCount'.$i);

    //                 if (isset($xCraft) && $reagentItems)
    //                 {
    //                     $reagents = new ItemList(array(['i.id', array_keys($reagentItems)]));
    //                     $reqReag  = [];

    //                     foreach ($reagents->iterate() as $__)
    //                         $reqReag[] = '<a href="?item='.$reagents->id.'">'.$reagents->getField('name', true).'</a> ('.$reagentItems[$reagents->id].')';

    //                     $xCraft .= '<div class="q1 whtt-reagents"><br>'.Lang::game('requires2').' '.implode(', ', $reqReag).'</div>';
    //                 }
    //             }
    //         }
    //     }
    // }

    // misc (no idea, how to organize the <br> better)
    const xMisc = [];

    // // itemset: pieces and boni
    // if (isset($xSet))
    //     xMisc[] = $xSet;

    // // funny, yellow text at the bottom, omit if we have a recipe
    // if ($this->curTpl['description_loc0'] && !$this->canTeachSpell())
    //     xMisc[] = '<span class="q">"'.$this->getField('description', true).'"</span>';

    // readable
    const PageText = this.editorService.form.controls.PageText.value;
    if (PageText > 0) {
      xMisc.push(`<span class="q2">${AOWOW_ITEM.readClick}</span>`);
    }

    // charges (i guess checking first spell is enough)
    const spellCharges1 = this.editorService.form.controls.spellcharges_1.value;
    if (spellCharges1 != null && spellCharges1 !== 0) {
      xMisc.push(`<span class="q1">${AOWOW_ITEM.charges.replace('%d', Math.abs(spellCharges1).toString())}</span>`);
    }

    // // list required reagents
    // if (isset($xCraft))
    //     xMisc[] = $xCraft;

    if (xMisc) {
      this.tmpItemPreview += xMisc.join('<br>') + '<br>';
    }

    const sellPrice = this.editorService.form.controls.SellPrice.value;
    if (sellPrice > 0) {
      this.tmpItemPreview += 'Sell Price: ' + formatMoney(sellPrice);
    }

    this.itemPreview = this.sanitizer.bypassSecurityTrustHtml(this.tmpItemPreview);
  }

  ngOnInit() {
    super.ngOnInit();
    this.calculatePreview();
    this.icon = this.sqliteQueryService.getDisplayIdIcon(this.editorService.form.controls.displayid.value);

    this.subscriptions.push(
      this.editorService.form.controls.displayid.valueChanges.subscribe((x: number) => {
        this.icon = this.sqliteQueryService.getDisplayIdIcon(x);
      })
    );

    this.subscriptions.push(
      this.editorService.form.valueChanges
        .pipe(
          debounceTime(600),
          distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
        )
        .subscribe(this.calculatePreview.bind(this))
    );
  }

}
