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
import { ITEM_CLASS, ITEM_SUBCLASS, ITEM_CLASS_RECIPE } from '@keira-constants/options/item-class';
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
import { ITEM_CONSTANTS } from './item_constants';
import { ItemTemplateService } from './item-template.service';
import { Observable } from 'rxjs';
import { ItemUtilsService } from './item-utils.service';
import { MAX_LEVEL } from './item-utils';

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
    public readonly sqliteQueryService: SqliteQueryService,
    private itemUtilsService: ItemUtilsService,
    private sanitizer: DomSanitizer,
  ) {
    super(editorService, handlerService);
  }

  public readonly ITEM_CONSTANTS = ITEM_CONSTANTS;
  public icon: Observable<string>;
  public hasItemLevel: boolean = false;
  public itemPreview: SafeHtml = this.sanitizer.bypassSecurityTrustHtml('loading...');
  private tmpItemPreview = '';

  private async calculatePreview() {
    this.tmpItemPreview = '';
    const green: string[] = [];

    const flags = this.editorService.form.controls.Flags.value;
    const bagFamily: number = Number(this.editorService.form.controls.BagFamily.value);
    const quality: number = Number(this.editorService.form.controls.Quality.value);

    // ITEM NAME
    const itemName = this.editorService.form.controls.name.value;
    if (itemName) {
      this.tmpItemPreview += '<b class="item-name q' + quality + '">' + itemName + '</b>';
    }

    // heroic tag
    if (flags & ITEM_FLAG.HEROIC && quality === ITEMS_QUALITY.EPIC) {
      this.tmpItemPreview += '<br><!-- ITEM_FLAG.HEROIC --><span class="q2">Heroic</span>';
    }

    this.tmpItemPreview += await this.itemUtilsService.getRequiredZone();

    // conjured
    if (flags & ITEM_FLAG.CONJURED) {
      this.tmpItemPreview += '<br> Conjured Item';
    }

    this.tmpItemPreview += this.itemUtilsService.getBonding();
    this.tmpItemPreview += this.itemUtilsService.getDuration();

    // // required holiday
    // if ($eId = $this->curTpl['eventId'])
    //   if ($hName = selectRow('SELECT h.* FROM ?_holidays h JOIN ?_events e ON e.holidayId = h.id WHERE e.id = ?d', $eId))
    //     this.tmpItemPreview += '<br>'.sprintf(Lang::game('requires'), '<a href="'.$eId.'" class="q1">
    //     '.Util::localizedString($hName, 'name').'</a>');

    // item begins a quest
    const startquest: number = Number(this.editorService.form.controls.startquest.value);
    if (startquest > 0) {
      this.tmpItemPreview += `<br><a class="q1" href="?quest=${startquest}">This Item Begins a Quest</a>`;
    }

    // containerType (slotCount)
    const containerSlots: number = Number(this.editorService.form.controls.ContainerSlots.value);
    if (containerSlots > 0) {
      const fam = bagFamily ? Math.log2(bagFamily) + 1 : 0;
      this.tmpItemPreview += `<br>${containerSlots} Slot ${ITEM_CONSTANTS.bagFamily[fam]}`;
    }

    this.tmpItemPreview += this.itemUtilsService.getClassText();
    this.tmpItemPreview += this.itemUtilsService.getDamageText();
    this.tmpItemPreview += this.itemUtilsService.getArmorText();

    // Item is a gem (don't mix with sockets) (TODO)
    this.tmpItemPreview += this.itemUtilsService.getGemEnchantment();

    // Random Enchantment - if random enchantment is set, prepend stats from it
    const RandomProperty: number = this.editorService.form.controls.RandomProperty.value;
    if (RandomProperty /* && empty($enhance['r']) */) {
      this.tmpItemPreview += `<br><span class="q2">${ITEM_CONSTANTS.randEnchant}</span>`;
    }/* else if (!empty($enhance['r'])) {
      this.tmpItemPreview += randEnchant;
    } */

    // itemMods (display stats and save ratings for later use)
    this.tmpItemPreview += this.itemUtilsService.getStats(green);

    this.tmpItemPreview += this.itemUtilsService.getMagicResistances();

    // Socket & Enchantment (TODO)
    this.tmpItemPreview += this.itemUtilsService.getSocketEnchantment();

    // durability
    const durability = this.editorService.form.controls.MaxDurability.value;
    if (durability) {
      this.tmpItemPreview += `<br>${ITEM_CONSTANTS.durability.replace(/%d/g, durability)}`;
    }

    this.tmpItemPreview += await this.itemUtilsService.getRequiredText();

    // TODO
    // // locked or openable
    // const lockid = this.editorService.form.controls.lockid.value;
    // const lockData = await this.sqliteQueryService.getLockById(lockid);
    // if (!!lockid && !!lockData) {
    //   this.tmpItemPreview += `<span class="q0">Locked<br>${lockData.join('<br>')}</span><br>`;
    // } else if (flags & ITEM_FLAG.OPENABLE) {
    //   this.tmpItemPreview += `<span class="q2">${ITEM_CONSTANTS.openClick}</span><br>`;
    // }

    // spells on item
    this.tmpItemPreview += await this.itemUtilsService.getSpellDesc(green);

    for (const bonus of green) {
      if (bonus) {
        this.tmpItemPreview += `<br><span class="q2">${bonus}</span>`;
      }
    }

    this.tmpItemPreview += this.itemUtilsService.getItemSet();

    // recipes, vanity pets, mounts
    this.tmpItemPreview += await this.itemUtilsService.getLearnSpellText();

    // misc (no idea, how to organize the <br> better)
    const xMisc = [];

    // // itemset: pieces and boni
    // if (isset($xSet))
    //     xMisc[] = $xSet;

    this.itemUtilsService.getMisc(xMisc);

    // // list required reagents
    // if (isset(xCraft))
    //     xMisc.push(xCraft);

    if (!!xMisc) {
      this.tmpItemPreview += xMisc.join('');
    }

    const sellPrice = this.editorService.form.controls.SellPrice.value;
    if (!!sellPrice) {
      this.tmpItemPreview += '<br>Sell Price: ' + this.itemUtilsService.formatMoney(sellPrice);
    }

    this.itemPreview = this.sanitizer.bypassSecurityTrustHtml(this.tmpItemPreview);
  }

  ngOnInit() {
    super.ngOnInit();
    this.calculatePreview();
    this.icon = this.sqliteQueryService.getIconByItemDisplayId(this.editorService.form.controls.displayid.value);

    this.subscriptions.push(
      this.editorService.form.controls.displayid.valueChanges.subscribe((icon: number) => {
        this.icon = this.sqliteQueryService.getIconByItemDisplayId(icon);
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
