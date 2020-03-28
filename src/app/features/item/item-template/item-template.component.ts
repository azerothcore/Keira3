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
import { ITEM_CLASS, ITEM_SUBCLASS } from '@keira-constants/options/item-class';
import { ITEM_MATERIAL } from '@keira-constants/options/item-material';
import { ITEMS_QUALITY, ITEM_QUALITY } from '@keira-constants/options/item-quality';
import { ITEM_SHEAT } from '@keira-constants/options/item-sheath';
import { SOCKET_BONUS } from '@keira-constants/options/socket-bonus';
import { STAT_TYPE } from '@keira-constants/options/stat-type';
import { TOTEM_CATEGORY } from '@keira-constants/options/totem-category';
import { SqliteQueryService } from '@keira-shared/services/sqlite-query.service';
import { ItemTemplate } from '@keira-types/item-template.type';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ItemHandlerService } from '../item-handler.service';
import { ItemPreviewService } from './item-preview.service';
import { ItemTemplateService } from './item-template.service';

@Component({
  selector: 'keira-item-template',
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
    private readonly sqliteQueryService: SqliteQueryService,
    private readonly itemPreviewService: ItemPreviewService,
    private readonly sanitizer: DomSanitizer,
  ) {
    super(editorService, handlerService);
  }

  public icon: Observable<string>;
  public itemPreview: SafeHtml = this.sanitizer.bypassSecurityTrustHtml('loading...');

  private async loadItemPreview() {
    this.itemPreview = this.sanitizer.bypassSecurityTrustHtml(
      await this.itemPreviewService.calculatePreview(this.editorService.form.value)
    );
  }

  ngOnInit() {
    super.ngOnInit();
    this.loadItemPreview();
    this.icon = this.sqliteQueryService.getIconByItemDisplayId(this.editorService.form.controls.displayid.value);

    this.subscriptions.push(
      this.editorService.form.controls.displayid.valueChanges.subscribe((icon: number) => {
        this.icon = this.sqliteQueryService.getIconByItemDisplayId(icon);
      })
    );

    this.subscriptions.push(
      this.editorService.form.valueChanges.pipe(
        debounceTime(600),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
      ).subscribe(this.loadItemPreview.bind(this))
    );
  }

}
