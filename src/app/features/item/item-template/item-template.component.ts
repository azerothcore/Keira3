import { Component } from '@angular/core';

import { SingleRowEditorComponent } from '../../../shared/abstract/components/editors/single-row-editor.component';
import { ItemTemplate } from '../../../shared/types/item-template.type';
import { ItemTemplateService } from '../item-template.service';
import { ItemHandlerService } from '../item-handler.service';
import { ITEM_CLASS, ITEM_SUBCLASS } from '../../../shared/constants/options/item-class';
import { ITEM_QUALITY } from '../../../shared/constants/options/item-quality';
import { ITEM_FLAGS } from '../../../shared/constants/flags/item-flags';
import { ITEM_FLAGS_EXTRA } from '../../../shared/constants/flags/item-flags-extra';
import { INVENTORY_TYPE } from '../../../shared/constants/options/inventory-type';
import { ALLOWABLE_CLASSES } from '../../../shared/constants/flags/allowable-classes';
import { ALLOWABLE_RACES } from '../../../shared/constants/flags/allowable-races';
import { FACTION_RANK } from '../../../shared/constants/options/faction-rank';
import { BAG_FAMILY } from '../../../shared/constants/flags/bag-family';
import { SOCKET_COLOR } from '../../../shared/constants/flags/socket-color';
import { ITEM_BONDING } from '../../../shared/constants/options/item-bonding';
import { ITEM_MATERIAL } from '../../../shared/constants/options/item-material';
import { ITEM_SHEAT } from '../../../shared/constants/options/item-sheath';
import { TOTEM_CATEGORY } from '../../../shared/constants/options/totem-category';
import { FOOD_TYPE } from '../../../shared/constants/options/foot-type';
import { ITEM_FLAGS_CUSTOM } from '../../../shared/constants/flags/item-flags-custom';
import { DAMAGE_TYPE } from '../../../shared/constants/options/damage-type';
import { SOCKET_BONUS } from '../../../shared/constants/options/socket-bonus';
import { FACTIONS } from '../../../shared/constants/options/faction';
import { STAT_TYPE } from '../../../shared/constants/options/stat-type';

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

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: ItemTemplateService,
    public handlerService: ItemHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
