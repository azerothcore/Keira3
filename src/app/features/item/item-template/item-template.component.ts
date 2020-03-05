import { Component, OnInit } from '@angular/core';
import { SingleRowEditorComponent } from '@keira-abstract/components/editors/single-row-editor.component';
import { ALLOWABLE_CLASSES } from '@keira-constants/flags/allowable-classes';
import { ALLOWABLE_RACES } from '@keira-constants/flags/allowable-races';
import { BAG_FAMILY } from '@keira-constants/flags/bag-family';
import { ITEM_FLAGS, ITEM_FLAG } from '@keira-constants/flags/item-flags';
import { ITEM_FLAGS_CUSTOM } from '@keira-constants/flags/item-flags-custom';
import { ITEM_FLAGS_EXTRA } from '@keira-constants/flags/item-flags-extra';
import { SOCKET_COLOR } from '@keira-constants/flags/socket-color';
import { DAMAGE_TYPE } from '@keira-constants/options/damage-type';
import { FACTIONS } from '@keira-constants/options/faction';
import { FACTION_RANK } from '@keira-constants/options/faction-rank';
import { FOOD_TYPE } from '@keira-constants/options/foot-type';
import { INVENTORY_TYPE } from '@keira-constants/options/inventory-type';
import { ITEM_BONDING } from '@keira-constants/options/item-bonding';
import { ITEM_CLASS, ITEM_SUBCLASS, ITEM_TYPE } from '@keira-constants/options/item-class';
import { ITEM_MATERIAL } from '@keira-constants/options/item-material';
import { ITEM_QUALITY, ITEMS_QUALITY } from '@keira-constants/options/item-quality';
import { ITEM_SHEAT } from '@keira-constants/options/item-sheath';
import { SOCKET_BONUS } from '@keira-constants/options/socket-bonus';
import { STAT_TYPE } from '@keira-constants/options/stat-type';
import { TOTEM_CATEGORY } from '@keira-constants/options/totem-category';
import { SqliteQueryService } from '@keira-shared/services/sqlite-query.service';
import { ItemTemplate } from '@keira-types/item-template.type';
import { distinctUntilChanged } from 'rxjs/operators';
import { ItemHandlerService } from '../item-handler.service';
import { AOWOW_ITEM, formatTime, getFeralAP } from './aowow';
import { ItemTemplateService } from './item-template.service';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';

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
    public sqliteQueryService: SqliteQueryService,
    private sanitizer: DomSanitizer,
  ) {
    super(editorService, handlerService);
  }

  public readonly AOWOW_ITEM = AOWOW_ITEM;
  public icon: Promise<string>;
  public statsTop: string = '';
  public statsBottom: string = '';
  public itemType: string = '';
  public hasItemLevel: boolean = false;
  public itemPreview: SafeHtml = '';

  private handleItemType() {
    this.subscriptions.push(
      this.editorService.form.controls?.class?.valueChanges.subscribe((itemClass: number) => {
        const subclass = this.editorService.form.controls?.subcclass?.value;
        if (ITEM_SUBCLASS[itemClass] && ITEM_SUBCLASS[itemClass][subclass]) {
          this.itemType = ITEM_SUBCLASS[itemClass][subclass].name;
        }

        this.hasItemLevel = [ITEM_TYPE.WEAPON, ITEM_TYPE.ARMOR, ITEM_TYPE.AMMUNITION].includes(itemClass);
      })
    );

    this.subscriptions.push(
      this.editorService.form.controls?.subclass?.valueChanges.subscribe((subclass: number) => {
        const itemClass = this.editorService.form.controls?.class?.value;
        this.itemType = (ITEM_SUBCLASS[itemClass] && ITEM_SUBCLASS[itemClass][subclass] && ITEM_SUBCLASS[itemClass][subclass].name) || '';
      })
    );
  }

  private calculateStats() {
    this.subscriptions.push(
      this.editorService.form.valueChanges.pipe(
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
      ).subscribe(() => {

        this.statsTop = '';
        this.statsBottom = '';

        for (const i of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
          const stat = this.editorService.form.controls['stat_value' + i].value;
          if (stat !== 0 && stat != null) {
            this.getStatType(
              this.editorService.form.controls['stat_type' + i].value,
              this.editorService.form.controls['stat_value' + i].value
            );
          }
        }
      })
    );
  }

  private calculatePreview() {
    this.itemPreview = '';

    const flags = this.editorService.form.controls.Flags.value;
    const bonding = this.editorService.form.controls.bonding.value;
    const maxcount = this.editorService.form.controls.maxcount.value;
    const bagFamily = this.editorService.form.controls.BagFamily.value;
    // const itemLimitCategory = this.editorService.form.controls.ItemLimitCategory.value;

    // ITEM NAME
    this.itemPreview += '<b class="item-name q' + this.editorService.form.controls.Quality.value + '">'
      + this.editorService.form.controls.name.value + '</b>';

    // heroic tag
    if (flags === ITEM_FLAG.HEROIC &&
        this.editorService.form.controls.Quality.value === ITEMS_QUALITY.EPIC) {
      this.itemPreview += '<br><span class="q2">Heroic</span>';
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
    //     this.itemPreview += '<br>'.Util::localizedString($area, 'name');
    // }

    // conjured
    if (flags === ITEM_FLAG.CONJURED) {
        this.itemPreview += '<br> Conjured Item';
    }

    // bonding
    if (flags === ITEM_FLAG.ACCOUNTBOUND) {
        this.itemPreview += '<br>' + this.AOWOW_ITEM.bonding[0];
    } else if (bonding) {
        this.itemPreview += '<br>' + this.AOWOW_ITEM.bonding[bonding];
    }

    // unique || unique-equipped || unique-limited
    if (maxcount === 1) {
        this.itemPreview += '<br>' + this.AOWOW_ITEM['unique'][0];
    } else if (maxcount && bagFamily !== 8192) { // not for currency tokens
        this.itemPreview += '<br>' + this.AOWOW_ITEM['unique'][1].replace('%d', maxcount.toString());
    } else if (flags === ITEM_FLAG.UNIQUEEQUIPPED) {
        this.itemPreview += '<br>' + this.AOWOW_ITEM['uniqueEquipped'][0];
    } /* else if (itemLimitCategory) {
        $limit = DB::Aowow()->selectRow("SELECT * FROM ?_itemlimitcategory WHERE id = ?", $this->curTpl['itemLimitCategory']);
        this.itemPreview += '<br>'.sprintf(Lang::item($limit['isGem'] ? 'uniqueEquipped' : 'unique', 2), Util::localizedString($limit, 'name'), $limit['count']);
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
      this.itemPreview += '<br>Duration' + ': ' + formatTime(duration * 1000) /* + rt */;
    }

    // // required holiday
    // if ($eId = $this->curTpl['eventId'])
    //   if ($hName = DB::Aowow()->selectRow('SELECT h.* FROM ?_holidays h JOIN ?_events e ON e.holidayId = h.id WHERE e.id = ?d', $eId))
    //     this.itemPreview += '<br>'.sprintf(Lang::game('requires'), '<a href="'.$eId.'" class="q1">
    //     '.Util::localizedString($hName, 'name').'</a>');

    // item begins a quest
    const startquest = this.editorService.form.controls.startquest.value;
    if (startquest) {
        this.itemPreview += `<br><a class="q1" href="?quest=${startquest}">This Item Begins a Quest</a>`;
    }

    // containerType (slotCount)
    const slots = this.editorService.form.controls.ContainerSlots.value;
    if (slots > 0) {
      const fam = bagFamily ? Math.log2(bagFamily) + 1 : 0;
      this.itemPreview += `<br>${slots} Slot ${AOWOW_ITEM.bagFamily[fam]}`;
    }

    const itemClass = this.editorService.form.controls.class.value;
    const subclass = this.editorService.form.controls.subclass.value;
    if ([ITEM_TYPE.ARMOR, ITEM_TYPE.WEAPON, ITEM_TYPE.AMMUNITION].includes(itemClass)) {
      this.itemPreview += '<table width="100%"><tr>';

      // Class
      if (slots) {
        this.itemPreview += `<td>${AOWOW_ITEM.inventoryType[slots]}</td>`;
      }

      // Subclass
      if (itemClass === ITEM_TYPE.ARMOR && subclass > 0) {
        this.itemPreview += `<th><!--asc ${subclass} -->${AOWOW_ITEM.armorSubClass[subclass]}</th>`;
      } else if (itemClass === ITEM_TYPE.WEAPON) {
        this.itemPreview += `<th>${AOWOW_ITEM.weaponSubClass[subclass]}</th>`;
      } else if (itemClass === ITEM_TYPE.AMMUNITION) {
        this.itemPreview += `<th>${AOWOW_ITEM.projectileSubClass[subclass]}</th>`;
      }

      this.itemPreview += '</tr></table>';

    // yes, slot can occur on random items and is then also displayed <_< .. excluding Bags >_>
    } else if (slots && itemClass !== ITEM_TYPE.CONTAINER) {
      this.itemPreview += `<br>${AOWOW_ITEM.inventoryType[subclass]}<br>`;
    } else {
      this.itemPreview += '<br>';
    }

    // Weapon/Ammunition Stats                          (not limited to weapons (see item:1700))
    const dmgmin1 = this.editorService.form.controls.dmg_min1.value;
    const dmgmin2 = this.editorService.form.controls.dmg_min2.value;
    const dmgmax1 = this.editorService.form.controls.dmg_max1.value;
    const dmgmax2 = this.editorService.form.controls.dmg_max2.value;
    const speed  = this.editorService.form.controls.delay.value / 1000;
    const sc1    = this.editorService.form.controls.dmg_type1.value;
    const sc2    = this.editorService.form.controls.dmg_type2.value;
    const dmgmin = dmgmin1 + dmgmin2;
    const dmgmax = dmgmax1 + dmgmax2;
    const dps    = speed ? (dmgmin + dmgmax) / (2 * speed) : 0;

    let dmg = '';

    if (itemClass === ITEM_TYPE.AMMUNITION && dmgmin && dmgmax) {
      if (sc1) {
        this.itemPreview += AOWOW_ITEM.damage.ammo[1].replace('%d', ((dmgmin + dmgmax) / 2).toString()) + AOWOW_ITEM.sc[sc1] + '<br>';
      } else {
        this.itemPreview += AOWOW_ITEM.damage.ammo[0].replace('%d', ((dmgmin + dmgmax) / 2).toString()) + '<br>';
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
          this.itemPreview += `<table width="100%"><tr><td>${dmg}</td><th>${speed}<!--spd-->${speed.toFixed(2)}</th></tr></table>`;
        } else {
          this.itemPreview += `<!--dmg-->${dmg}<br>`;
        }

        // secondary damage is set
        if ((dmgmin2 || dmgmax2) && dmgmin2 !== dmgmax2) {
          this.itemPreview += AOWOW_ITEM.damage.range[sc2 ? 3 : 2]
            .replace('%d', dmgmin2)
            .replace('%d', dmgmax2)
            .replace('%s', sc2 ? AOWOW_ITEM.sc[sc2] : '')
            + '<br>';
        } else if (dmgmin2) {
          this.itemPreview += AOWOW_ITEM.damage.single[sc2 ? 3 : 2]
            .replace('%d', dmgmin2)
            .replace('%s', sc2 ? AOWOW_ITEM.sc[sc2] : '')
            + '<br>';
        }

        if (itemClass === ITEM_TYPE.WEAPON) {
          this.itemPreview += `<!--dps-->${AOWOW_ITEM.dps[dps]}<br>`;
        }

        // display FeralAttackPower if set
        const fap = getFeralAP(itemClass, subclass, dps);
        if (fap) {
          this.itemPreview += `<span class="c11"><!--fap-->(${fap} ${AOWOW_ITEM.fap})</span><br>`;
        }
    }

    // // Armor
    // if (itemClass == ITEM_CLASS_ARMOR && $this->curTpl['armorDamageModifier'] > 0)
    // {
    //     $spanI = 'class="q2"';
    //     if ($interactive)
    //         $spanI = 'class="q2 tip" onmouseover="$WH.Tooltip.showAtCursor(event, $WH.sprintf(LANG.tooltip_armorbonus, '.$this->curTpl['armorDamageModifier'].'), 0, 0, \'q\')" onmousemove="$WH.Tooltip.cursorUpdate(event)" onmouseout="$WH.Tooltip.hide()"';

    //     this.itemPreview += '<span '.$spanI.'><!--addamr'.$this->curTpl['armorDamageModifier'].'--><span>'.Lang::item('armor', [$this->curTpl['armor']]).'</span></span><br>';
    // }
    // else if ($this->curTpl['armor'])
    //     this.itemPreview += '<span><!--amr-->'.Lang::item('armor', [$this->curTpl['armor']]).'</span><br>';

    // // Block (note: block value from field block and from field stats or parsed from itemSpells are displayed independently)
    // if ($this->curTpl['tplBlock'])
    //     this.itemPreview += '<span>'.sprintf(Lang::item('block'), $this->curTpl['tplBlock']).'</span><br>';

    // // Item is a gem (don't mix with sockets)
    // if ($geId = $this->curTpl['gemEnchantmentId'])
    // {
    //     $gemEnch = DB::Aowow()->selectRow('SELECT * FROM ?_itemenchantment WHERE id = ?d', $geId);
    //     this.itemPreview += '<span class="q1"><a href="?enchantment='.$geId.'">'.Util::localizedString($gemEnch, 'name').'</a></span><br>';

    //     // activation conditions for meta gems
    //     if (!empty($gemEnch['conditionId']))
    //     {
    //         if ($gemCnd = DB::Aowow()->selectRow('SELECT * FROM ?_itemenchantmentcondition WHERE id = ?d', $gemEnch['conditionId']))
    //         {
    //             for ($i = 1; $i < 6; $i++)
    //             {
    //                 if (!$gemCnd['color'.$i])
    //                     continue;

    //                 $vspfArgs = [];
    //                 switch ($gemCnd['comparator'.$i])
    //                 {
    //                     case 2:                         // requires less <color> than (<value> || <comparecolor>) gems
    //                     case 5:                         // requires at least <color> than (<value> || <comparecolor>) gems
    //                         $vspfArgs = [$gemCnd['value'.$i], Lang::item('gemColors', $gemCnd['color'.$i] - 1)];
    //                         break;
    //                     case 3:                         // requires more <color> than (<value> || <comparecolor>) gems
    //                         $vspfArgs = [Lang::item('gemColors', $gemCnd['color'.$i] - 1), Lang::item('gemColors', $gemCnd['cmpColor'.$i] - 1)];
    //                         break;
    //                     default:
    //                         continue;
    //                 }

    //                 this.itemPreview += '<span class="q0">'.Lang::achievement('reqNumCrt').' '.Lang::item('gemConditions', $gemCnd['comparator'.$i], $vspfArgs).'</span><br>';
    //             }
    //         }
    //     }
    // }

    // // Random Enchantment - if random enchantment is set, prepend stats from it
    // if ($this->curTpl['randomEnchant'] && empty($enhance['r']))
    //     this.itemPreview += '<span class="q2">'.Lang::item('randEnchant').'</span><br>';
    // else if (!empty($enhance['r']))
    //     this.itemPreview += $randEnchant;

    // // itemMods (display stats and save ratings for later use)
    // for ($j = 1; $j <= 10; $j++)
    // {
    //     $type = $this->curTpl['statType'.$j];
    //     $qty  = $this->curTpl['statValue'.$j];

    //     if (!$qty || $type <= 0)
    //         continue;

    //     // base stat
    //     switch ($type)
    //     {
    //         case ITEM_MOD_MANA:
    //         case ITEM_MOD_HEALTH:
    //             // $type += 1;                          // i think i fucked up somewhere mapping item_mods: offsets may be required somewhere
    //         case ITEM_MOD_AGILITY:
    //         case ITEM_MOD_STRENGTH:
    //         case ITEM_MOD_INTELLECT:
    //         case ITEM_MOD_SPIRIT:
    //         case ITEM_MOD_STAMINA:
    //             this.itemPreview += '<span><!--stat'.$type.'-->'.($qty > 0 ? '+' : '-').abs($qty).' '.Lang::item('statType', $type).'</span><br>';
    //             break;
    //         default:                                    // rating with % for reqLevel
    //             $green[] = $this->parseRating($type, $qty, $interactive, $causesScaling);

    //     }
    // }

    // // magic resistances
    // foreach (Game::$resistanceFields as $j => $rowName)
    //     if ($rowName && $this->curTpl[$rowName] != 0)
    //         this.itemPreview += '+'.$this->curTpl[$rowName].' '.Lang::game('resistances', $j).'<br>';

    // // Enchantment
    // if (isset($enhance['e']))
    // {
    //     if ($enchText = DB::Aowow()->selectRow('SELECT * FROM ?_itemenchantment WHERE Id = ?', $enhance['e']))
    //         this.itemPreview += '<span class="q2"><!--e-->'.Util::localizedString($enchText, 'name').'</span><br>';
    //     else
    //     {
    //         unset($enhance['e']);
    //         this.itemPreview += '<!--e-->';
    //     }
    // }
    // else                                                // enchantment placeholder
    //     this.itemPreview += '<!--e-->';

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
    //         this.itemPreview += '<a href="?items=3&amp;filter=cr=81;crs='.($colorId + 1).';crv=0" class="socket-'.Game::$sockets[$colorId].' q'.$col.'" '.$icon.'>'.$text.'</a><br>';
    //     else
    //         this.itemPreview += '<span class="socket-'.Game::$sockets[$colorId].' q'.$col.'" '.$icon.'>'.$text.'</span><br>';
    // }

    // // fill extra socket
    // if (isset($enhance['s']))
    // {
    //     $pop  = array_pop($enhance['g']);
    //     $col  = $pop ? 1 : 0;
    //     $icon = $pop ? sprintf(Util::$bgImagePath['tiny'], STATIC_URL, strtolower($gems[$pop]['iconString'])) : null;
    //     $text = $pop ? Util::localizedString($gems[$pop], 'name') : Lang::item('socket', -1);

    //     if ($interactive)
    //         this.itemPreview += '<a href="?items=3&amp;filter=cr=81;crs=5;crv=0" class="socket-prismatic q'.$col.'" '.$icon.'>'.$text.'</a><br>';
    //     else
    //         this.itemPreview += '<span class="socket-prismatic q'.$col.'" '.$icon.'>'.$text.'</span><br>';
    // }
    // else                                                // prismatic socket placeholder
    //     this.itemPreview += '<!--ps-->';

    // if ($_ = $this->curTpl['socketBonus'])
    // {
    //     $sbonus = DB::Aowow()->selectRow('SELECT * FROM ?_itemenchantment WHERE Id = ?d', $_);
    //     this.itemPreview += '<span class="q'.($hasMatch ? '2' : '0').'">'.Lang::item('socketBonus', ['<a href="?enchantment='.$_.'">'.Util::localizedString($sbonus, 'name').'</a>']).'</span><br>';
    // }

    // // durability
    // if ($dur = $this->curTpl['durability'])
    //     this.itemPreview += sprintf(Lang::item('durability'), $dur, $dur).'<br>';

    // // required classes
    // if ($classes = Lang::getClassString($this->curTpl['requiredClass'], $jsg, $__))
    // {
    //     foreach ($jsg as $js)
    //         if (empty($this->jsGlobals[TYPE_CLASS][$js]))
    //             $this->jsGlobals[TYPE_CLASS][$js] = $js;

    //     this.itemPreview += Lang::game('classes').Lang::main('colon').$classes.'<br>';
    // }

    // // required races
    // if ($races = Lang::getRaceString($this->curTpl['requiredRace'], $jsg, $__))
    // {
    //     foreach ($jsg as $js)
    //         if (empty($this->jsGlobals[TYPE_RACE][$js]))
    //             $this->jsGlobals[TYPE_RACE][$js] = $js;

    //     this.itemPreview += Lang::game('races').Lang::main('colon').$races.'<br>';
    // }

    // // required honorRank (not used anymore)
    // if ($rhr = $this->curTpl['requiredHonorRank'])
    //     this.itemPreview += sprintf(Lang::game('requires'), Lang::game('pvpRank', $rhr)).'<br>';

    // // required CityRank..?
    // // what the f..

    // // required level
    // if (($_flags & ITEM_FLAG_ACCOUNTBOUND) && $_quality == ITEM_QUALITY_HEIRLOOM)
    //     this.itemPreview += sprintf(Lang::item('reqLevelRange'), 1, MAX_LEVEL, ($interactive ? sprintf(Util::$changeLevelString, MAX_LEVEL) : '<!--lvl-->'.MAX_LEVEL)).'<br>';
    // else if ($_reqLvl > 1)
    //     this.itemPreview += sprintf(Lang::item('reqMinLevel'), $_reqLvl).'<br>';

    // // required arena team rating / personal rating / todo (low): sort out what kind of rating
    // if (!empty($this->getExtendedCost([], $reqRating)[$this->id]) && $reqRating)
    //     this.itemPreview += sprintf(Lang::item('reqRating', $reqRating[1]), $reqRating[0]).'<br>';

    // // item level
    // if (in_array(itemClass, [ITEM_CLASS_ARMOR, ITEM_CLASS_WEAPON]))
    //     this.itemPreview += sprintf(Lang::item('itemLevel'), $this->curTpl['itemLevel']).'<br>';

    // // required skill
    // if ($reqSkill = $this->curTpl['requiredSkill'])
    // {
    //     $_ = '<a class="q1" href="?skill='.$reqSkill.'">'.SkillList::getName($reqSkill).'</a>';
    //     if ($this->curTpl['requiredSkillRank'] > 0)
    //         $_ .= ' ('.$this->curTpl['requiredSkillRank'].')';

    //     this.itemPreview += sprintf(Lang::game('requires'), $_).'<br>';
    // }

    // // required spell
    // if ($reqSpell = $this->curTpl['requiredSpell'])
    //     this.itemPreview += Lang::game('requires2').' <a class="q1" href="?spell='.$reqSpell.'">'.SpellList::getName($reqSpell).'</a><br>';

    // // required reputation w/ faction
    // if ($reqFac = $this->curTpl['requiredFaction'])
    //     this.itemPreview += sprintf(Lang::game('requires'), '<a class="q1" href="?faction='.$reqFac.'">'.FactionList::getName($reqFac).'</a> - '.Lang::game('rep', $this->curTpl['requiredFactionRank'])).'<br>';

    // // locked or openable
    // if ($locks = Lang::getLocks($this->curTpl['lockId'], true))
    //     this.itemPreview += '<span class="q0">'.Lang::item('locked').'<br>'.implode('<br>', $locks).'</span><br>';
    // else if ($this->curTpl['flags'] & ITEM_FLAG_OPENABLE)
    //     this.itemPreview += '<span class="q2">'.Lang::item('openClick').'</span><br>';

    // // upper table: done
    // if (!$subOf)
    //     this.itemPreview += '</td></tr></table>';

    // // spells on item
    // if (!$this->canTeachSpell())
    // {
    //     $itemSpellsAndTrigger = [];
    //     for ($j = 1; $j <= 5; $j++)
    //     {
    //         if ($this->curTpl['spellId'.$j] > 0)
    //         {
    //             $cd = $this->curTpl['spellCooldown'.$j];
    //             if ($cd < $this->curTpl['spellCategoryCooldown'.$j])
    //                 $cd = $this->curTpl['spellCategoryCooldown'.$j];

    //             $cd = $cd < 5000 ? null : ' ('.sprintf(Lang::game('cooldown'), Util::formatTime($cd)).')';

    //             $itemSpellsAndTrigger[$this->curTpl['spellId'.$j]] = [$this->curTpl['spellTrigger'.$j], $cd];
    //         }
    //     }

    //     if ($itemSpellsAndTrigger)
    //     {
    //         $cooldown = '';

    //         $itemSpells = new SpellList(array(['s.id', array_keys($itemSpellsAndTrigger)]));
    //         foreach ($itemSpells->iterate() as $__)
    //             if ($parsed = $itemSpells->parseText('description', $_reqLvl > 1 ? $_reqLvl : MAX_LEVEL, false, $causesScaling)[0])
    //             {
    //                 if ($interactive)
    //                 {
    //                     $link   = '<a href="?spell='.$itemSpells->id.'">%s</a>';
    //                     $parsed = preg_replace_callback('/([^;]*)(&nbsp;<small>.*?<\/small>)([^&]*)/i', function($m) use($link) {
    //                             $m[1] = $m[1] ? sprintf($link, $m[1]) : '';
    //                             $m[3] = $m[3] ? sprintf($link, $m[3]) : '';
    //                             return $m[1].$m[2].$m[3];
    //                         }, $parsed, -1, $nMatches
    //                     );

    //                     if (!$nMatches)
    //                         $parsed = sprintf($link, $parsed);
    //                 }

    //                 $green[] = Lang::item('trigger', $itemSpellsAndTrigger[$itemSpells->id][0]).$parsed.$itemSpellsAndTrigger[$itemSpells->id][1];
    //             }
    //     }
    // }

    // // lower table (ratings, spells, ect)
    // if (!$subOf)
    //     this.itemPreview += '<table><tr><td>';

    // if (isset($green))
    //     foreach ($green as $j => $bonus)
    //         if ($bonus)
    //             this.itemPreview += '<span class="q2">'.$bonus.'</span><br>';

    // // Item Set
    // $pieces  = [];
    // if ($setId = $this->getField('itemset'))
    // {
    //     // while Ids can technically be used multiple times the only difference in data are the items used. So it doesn't matter what we get
    //     $itemset = new ItemsetList(array(['id', $setId]));
    //     if (!$itemset->error && $itemset->pieceToSet)
    //     {
    //         $pieces = DB::Aowow()->select('
    //             SELECT b.id AS ARRAY_KEY, b.name_loc0, b.name_loc2, b.name_loc3, b.name_loc4, b.name_loc6, b.name_loc8, GROUP_CONCAT(a.id SEPARATOR \':\') AS equiv
    //             FROM   ?_items a, ?_items b
    //             WHERE  a.slotBak = b.slotBak AND a.itemset = b.itemset AND b.id IN (?a)
    //             GROUP BY b.id;',
    //             array_keys($itemset->pieceToSet)
    //         );

    //         foreach ($pieces as $k => &$p)
    //             $p = '<span><!--si'.$p['equiv'].'--><a href="?item='.$k.'">'.Util::localizedString($p, 'name').'</a></span>';

    //         $xSet = '<br><span class="q">'.Lang::item('setName', ['<a href="?itemset='.$itemset->id.'" class="q">'.$itemset->getField('name', true).'</a>', 0, count($pieces)]).'</span>';

    //         if ($skId = $itemset->getField('skillId'))      // bonus requires skill to activate
    //         {
    //             $xSet .= '<br>'.sprintf(Lang::game('requires'), '<a href="?skills='.$skId.'" class="q1">'.SkillList::getName($skId).'</a>');

    //             if ($_ = $itemset->getField('skillLevel'))
    //                 $xSet .= ' ('.$_.')';

    //             $xSet .= '<br>';
    //         }

    //         // list pieces
    //         $xSet .= '<div class="q0 indent">'.implode('<br>', $pieces).'</div><br>';

    //         // get bonuses
    //         $setSpellsAndIdx = [];
    //         for ($j = 1; $j <= 8; $j++)
    //             if ($_ = $itemset->getField('spell'.$j))
    //                 $setSpellsAndIdx[$_] = $j;

    //         $setSpells = [];
    //         if ($setSpellsAndIdx)
    //         {
    //             $boni = new SpellList(array(['s.id', array_keys($setSpellsAndIdx)]));
    //             foreach ($boni->iterate() as $__)
    //             {
    //                 $setSpells[] = array(
    //                     'tooltip' => $boni->parseText('description', $_reqLvl > 1 ? $_reqLvl : MAX_LEVEL, false, $causesScaling)[0],
    //                     'entry'   => $itemset->getField('spell'.$setSpellsAndIdx[$boni->id]),
    //                     'bonus'   => $itemset->getField('bonus'.$setSpellsAndIdx[$boni->id])
    //                 );
    //             }
    //         }

    //         // sort and list bonuses
    //         $xSet .= '<span class="q0">';
    //         for ($i = 0; $i < count($setSpells); $i++)
    //         {
    //             for ($j = $i; $j < count($setSpells); $j++)
    //             {
    //                 if ($setSpells[$j]['bonus'] >= $setSpells[$i]['bonus'])
    //                     continue;

    //                 $tmp = $setSpells[$i];
    //                 $setSpells[$i] = $setSpells[$j];
    //                 $setSpells[$j] = $tmp;
    //             }
    //             $xSet .= '<span>'.Lang::item('setBonus', [$setSpells[$i]['bonus'], '<a href="?spell='.$setSpells[$i]['entry'].'">'.$setSpells[$i]['tooltip'].'</a>']).'</span>';
    //             if ($i < count($setSpells) - 1)
    //                 $xSet .= '<br>';
    //         }
    //         $xSet .= '</span>';
    //     }
    // }

    // // recipes, vanity pets, mounts
    // if ($this->canTeachSpell())
    // {
    //     $craftSpell = new SpellList(array(['s.id', intVal($this->curTpl['spellId2'])]));
    //     if (!$craftSpell->error)
    //     {
    //         $xCraft = '';
    //         if ($desc = $this->getField('description', true))
    //             this.itemPreview += '<span class="q2">'.Lang::item('trigger', 0).' <a href="?spell='.$this->curTpl['spellId2'].'">'.$desc.'</a></span><br>';

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

    // // misc (no idea, how to organize the <br> better)
    // $xMisc = [];

    // // itemset: pieces and boni
    // if (isset($xSet))
    //     $xMisc[] = $xSet;

    // // funny, yellow text at the bottom, omit if we have a recipe
    // if ($this->curTpl['description_loc0'] && !$this->canTeachSpell())
    //     $xMisc[] = '<span class="q">"'.$this->getField('description', true).'"</span>';

    // // readable
    // if ($this->curTpl['pageTextId'])
    //     $xMisc[] = '<span class="q2">'.Lang::item('readClick').'</span>';

    // // charges (i guess checking first spell is enough)
    // if ($this->curTpl['spellCharges1'])
    //     $xMisc[] = '<span class="q1">'.Lang::item('charges', [abs($this->curTpl['spellCharges1'])]).'</span>';

    // // list required reagents
    // if (isset($xCraft))
    //     $xMisc[] = $xCraft;

    // if ($xMisc)
    //     this.itemPreview += implode('<br>', $xMisc);

    // if ($sp = $this->curTpl['sellPrice'])
    //     this.itemPreview += '<div class="q1 whtt-sellprice">'.Lang::item('sellPrice').Lang::main('colon').Util::formatMoney($sp).'</div>';

    // if (!$subOf)
    //     this.itemPreview += '</td></tr></table>';

    // // tooltip scaling
    // if (!isset($xCraft))
    // {
    //     $link = [$subOf ? $subOf : $this->id, 1];       // itemId, scaleMinLevel
    //     if (isset($this->ssd[$this->id]))               // is heirloom
    //     {
    //         array_push($link,
    //             $this->ssd[$this->id]['maxLevel'],      // scaleMaxLevel
    //             $this->ssd[$this->id]['maxLevel'],      // scaleCurLevel
    //             $this->curTpl['scalingStatDistribution'],  // scaleDist
    //             $this->curTpl['scalingStatValue']       // scaleFlags
    //         );
    //     }
    //     else                                            // may still use level dependant ratings
    //     {
    //         array_push($link,
    //             $causesScaling ? MAX_LEVEL : 1,         // scaleMaxLevel
    //             $_reqLvl > 1 ? $_reqLvl : MAX_LEVEL     // scaleCurLevel
    //         );
    //     }
    //     this.itemPreview += '<!--?'.implode(':', $link).'-->';
    // }

    // return $x;


    this.itemPreview = this.sanitizer.bypassSecurityTrustHtml(this.itemPreview as string);
  }

  getStatType(type: number, val: number): void {

    if (this.AOWOW_ITEM.statType[type] == null || val === 0) {
      return;
    }

    if (type <= 7) {
      const stat = this.STAT_TYPE.find(st => st.value === type).name;
      this.statsTop += '<span style="text-transform: capitalize;">' + (val > 0 ? '+' + val : '-' + val) + ' ' + stat.toLowerCase().replace(/_/g, ' ') + '</span><br>';
    } else { //  (type > 7)
      this.statsBottom += '<span style="color: #1eff00">' + this.AOWOW_ITEM.statType[type].replace(/%d/g, val.toString()) + '</span><br>';
    }
  }

  getPrice(val: number) {
    const COPPER = ' <img src="../../../../../assets/img/money/copper.gif"> &nbsp;';
    const SILVER = ' <img src="../../../../../assets/img/money/silver.gif"> &nbsp;';
    const GOLD   = ' <img src="../../../../../assets/img/money/gold.gif"> &nbsp;';

    if (val <= 99 && val > 0) {
      return this.parsePrice(val.toString(), COPPER);
    } else if (val > 99 && val <= 9999) {

      return this.parsePrice(val.toString().substr(0, 2), SILVER) +
             this.parsePrice(val.toString().substr(2, 2), COPPER);
    } else if (val > 9999) {

      return this.parsePrice(val.toString().substr(0, 2), GOLD) +
             this.parsePrice(val.toString().substr(2, 2), SILVER) +
             this.parsePrice(val.toString().substr(4, 2), COPPER);
    }
  }

  parsePrice(price: string, type: string): string {
    return price !== '00' ? price + type : '';
  }

  ngOnInit() {
    super.ngOnInit();
    this.editorService.form.get('displayid').valueChanges.subscribe((x) => {
      this.icon = this.sqliteQueryService.getDisplayIdIcon(x);
    });

    // this.handleItemType();
    // this.calculateStats();
    this.subscriptions.push(
      this.editorService.form.valueChanges.subscribe(this.calculatePreview.bind(this))
    );
  }

}
