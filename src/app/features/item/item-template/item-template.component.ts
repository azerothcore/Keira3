import { Component, OnInit } from '@angular/core';
import { SingleRowEditorComponent } from '@keira-abstract/components/editors/single-row-editor.component';
import { ALLOWABLE_CLASSES } from '@keira-constants/flags/allowable-classes';
import { ALLOWABLE_RACES } from '@keira-constants/flags/allowable-races';
import { BAG_FAMILY } from '@keira-constants/flags/bag-family';
import { ITEM_FLAGS } from '@keira-constants/flags/item-flags';
import { ITEM_FLAGS_CUSTOM } from '@keira-constants/flags/item-flags-custom';
import { ITEM_FLAGS_EXTRA } from '@keira-constants/flags/item-flags-extra';
import { SOCKET_COLOR } from '@keira-constants/flags/socket-color';
import { DAMAGE_TYPE } from '@keira-constants/options/damage-type';
import { FACTIONS } from '@keira-constants/options/faction';
import { FACTION_RANK } from '@keira-constants/options/faction-rank';
import { FOOD_TYPE } from '@keira-constants/options/foot-type';
import { INVENTORY_TYPE } from '@keira-constants/options/inventory-type';
import { ITEM_BONDING } from '@keira-constants/options/item-bonding';
import { ITEM_CLASS, ITEM_SUBCLASS } from '@keira-constants/options/item-class';
import { ITEM_MATERIAL } from '@keira-constants/options/item-material';
import { ITEM_QUALITY } from '@keira-constants/options/item-quality';
import { ITEM_SHEAT } from '@keira-constants/options/item-sheath';
import { SOCKET_BONUS } from '@keira-constants/options/socket-bonus';
import { STAT_TYPE } from '@keira-constants/options/stat-type';
import { TOTEM_CATEGORY } from '@keira-constants/options/totem-category';
import { SqliteQueryService } from '@keira-shared/services/sqlite-query.service';
import { ItemTemplate } from '@keira-types/item-template.type';
import { distinctUntilChanged } from 'rxjs/operators';
import { ItemHandlerService } from '../item-handler.service';
import { AOWOW_ITEM } from './aowow';
import { ItemTemplateService } from './item-template.service';

enum ITEM_TYPE {
  WEAPON     = 2,
  ARMOR      = 4,
  AMMUNITION = 6,
}

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
  ) {
    super(editorService, handlerService);
  }

  public readonly AOWOW_ITEM = AOWOW_ITEM;
  public icon: Promise<string>;
  public statsTop: string = '';
  public statsBottom: string = '';
  public itemClass: string = '';
  public hasItemLevel: boolean = false;

  private handleItemClass() {
    this.subscriptions.push(
      this.editorService.form.controls?.class?.valueChanges.subscribe((itemClass: number) => {
        const subclass = this.editorService.form.controls?.subcclass?.value;
        this.itemClass = ITEM_SUBCLASS[itemClass] && ITEM_SUBCLASS[itemClass][subclass] && ITEM_SUBCLASS[itemClass][subclass].name;

        this.hasItemLevel = [ITEM_TYPE.WEAPON, ITEM_TYPE.ARMOR, ITEM_TYPE.AMMUNITION].includes(itemClass);
      })
    );

    this.subscriptions.push(
      this.editorService.form.controls?.subclass?.valueChanges.subscribe((subclass: number) => {
        const itemClass = this.editorService.form.controls?.class?.value;
        this.itemClass = ITEM_SUBCLASS[itemClass] && ITEM_SUBCLASS[itemClass][subclass] && ITEM_SUBCLASS[itemClass][subclass].name;
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

    this.handleItemClass();
    this.calculateStats();
  }

}
