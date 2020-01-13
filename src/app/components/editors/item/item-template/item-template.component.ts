import { Component } from '@angular/core';

import { SingleRowEditorComponent } from '../../shared/single-row-editor.component';
import { ItemTemplate } from '../../../../types/item-template.type';
import { ItemTemplateService } from '../../../../services/editors/item/item-template.service';
import { ItemHandlerService } from '../../../../services/handlers/item-handler.service';
import { ITEM_CLASS, ITEM_SUBCLASS } from '../../../../constants/options/item-class';
import { ITEM_QUALITY } from '../../../../constants/options/item-quality';
import { ITEM_FLAGS } from '../../../../constants/flags/item-flags';
import { ITEM_FLAGS_EXTRA } from '../../../../constants/flags/item-flags-extra';
import { INVENTORY_TYPE } from '../../../../constants/options/inventory-type';
import { ALLOWABLE_CLASSES } from '../../../../constants/flags/allowable-classes';
import { ALLOWABLE_RACES } from '../../../../constants/flags/allowable-races';
import { FACTION_RANK } from '../../../../constants/options/faction-rank';
import { BAG_FAMILY } from '../../../../constants/flags/bag-family';
import { SOCKET_COLOR } from '../../../../constants/flags/socket-color';
import { ITEM_BONDING } from '../../../../constants/options/item-bonding';
import { ITEM_MATERIAL } from '../../../../constants/options/item-material';
import { ITEM_SHEAT } from '../../../../constants/options/item-sheath';
import { TOTEM_CATEGORY } from '../../../../constants/options/totem-category';
import { FOOD_TYPE } from '../../../../constants/options/foot-type';
import { ITEM_FLAGS_CUSTOM } from '../../../../constants/flags/item-flags-custom';
import { DAMAGE_TYPE } from '../../../../constants/options/damage-type';
import { SOCKET_BONUS } from '../../../../constants/options/socket-bonus';
import { FACTIONS } from '../../../../constants/options/faction';
import { STAT_TYPE } from '../../../../constants/options/stat-type';

@Component({
  selector: 'app-item-template',
  templateUrl: './item-template.component.html',
  styleUrls: ['./item-template.component.scss']
})
export class ItemTemplateComponent extends SingleRowEditorComponent<ItemTemplate> {

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

  public bottomTextPreview: string = '';

  public readonly statType = [ // ITEM_MOD_*
    'Mana',
    'Health',
    null,
    'Agility',
    'Strength',
    'Intellect',
    'Spirit',
    'Stamina',
    null, null, null, null,
    'Increases defense rating by %d.',
    'Increases your dodge rating by %d.',
    'Increases your parry rating by %d.',
    'Increases your shield block rating by %d.',
    'Improves melee hit rating by %d.',
    'Improves ranged hit rating by %d.',
    'Improves spell hit rating by %d.',
    'Improves melee critical strike rating by %d.',
    'Improves ranged critical strike rating by %d.',
    'Improves spell critical strike rating by %d.',
    'Improves melee hit avoidance rating by %d.',
    'Improves ranged hit avoidance rating by %d.',
    'Improves spell hit avoidance rating by %d.',
    'Improves melee critical avoidance rating by %d.',
    'Improves ranged critical avoidance rating by %d.',
    'Improves spell critical avoidance rating by %d.',
    'Improves melee haste rating by %d.',
    'Improves ranged haste rating by %d.',
    'Improves spell haste rating by %d.',
    'Improves hit rating by %d.',
    'Improves critical strike rating by %d.',
    'Improves hit avoidance rating by %d.',
    'Improves critical avoidance rating by %d.',
    'Increases your resilience rating by %d.',
    'Increases your haste rating by %d.',
    'Increases expertise rating by %d.',
    'Increases attack power by %d.',
    'Increases ranged attack power by %d.',
    'Increases attack power by %d in Cat, Bear, Dire Bear, and Moonkin forms only.',
    'Increases damage done by magical spells and effects by up to %d.',
    'Increases healing done by magical spells and effects by up to %d.',
    'Restores %d mana per 5 sec.',
    'Increases your armor penetration rating by %d.',
    'Increases spell power by %d.',
    'Restores %d health per 5 sec.',
    'Increases spell penetration by %d.',
    'Increases the block value of your shield by %d.',
    'Unknown Bonus #%d (%d)',
  ];

  getStatType(type: number, val: number): string {
    if (this.statType[type] == null || val === 0) {
      return '';
    }

    if (type <= 7) {
      const stat = this.STAT_TYPE.find(st => st.value === type).name;
      return '<span style="text-transform: capitalize;">' +
             (val > 0 ? '+' + val : '-' + val) + ' ' + stat.toLowerCase().replace(/_/g, ' ') +
             '</span>';
    }

    this.bottomTextPreview = (this.bottomTextPreview !== null ? this.bottomTextPreview : '') +
                             '<span style="color: #1eff00">' + this.statType[type].replace(/%d/g, val.toString()) + '</span><br>';

    return '';
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

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: ItemTemplateService,
    public handlerService: ItemHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
