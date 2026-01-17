import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {
  ALLOWABLE_CLASSES,
  ALLOWABLE_RACES,
  BAG_FAMILY,
  DAMAGE_TYPE,
  FACTION_RANK,
  FOOD_TYPE,
  INVENTORY_TYPE,
  ITEM_BONDING,
  ITEM_CLASS,
  ITEM_FLAGS,
  ITEM_FLAGS_CUSTOM,
  ITEM_FLAGS_EXTRA,
  ITEM_MATERIAL,
  ITEM_QUALITY,
  ITEM_SHEAT,
  ITEM_SUBCLASS,
  ItemTemplate,
  PVP_RANK,
  SOCKET_COLOR,
  STAT_TYPE,
  TOTEM_CATEGORY,
} from '@keira/shared/acore-world-model';
import { SingleRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { IconComponent, QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { InventoryType, Model3DViewerComponent, VIEWER_TYPE } from '@keira/shared/model-3d-viewer';
import {
  AreaSelectorBtnComponent,
  FactionSelectorBtnComponent,
  FlagsSelectorBtnComponent,
  HolidaySelectorBtnComponent,
  ItemEnchantmentSelectorBtnComponent,
  ItemLimitCategorySelectorBtnComponent,
  LanguageSelectorBtnComponent,
  MapSelectorBtnComponent,
  QuestSelectorBtnComponent,
  SingleValueSelectorBtnComponent,
  SkillSelectorBtnComponent,
  SpellSelectorBtnComponent,
} from '@keira/shared/selectors';
import { compareObjFn } from '@keira/shared/utils';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ItemHandlerService } from '../item-handler.service';
import { SPELL_TRIGGERS } from './item-constants';
import { ItemPreviewService } from './item-preview.service';
import { ItemTemplateService } from './item-template.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-item-template',
  templateUrl: './item-template.component.html',
  styleUrls: ['./item-template.component.scss'],
  imports: [
    TopBarComponent,
    TranslateModule,
    QueryOutputComponent,
    FormsModule,
    ReactiveFormsModule,
    TooltipModule,
    SingleValueSelectorBtnComponent,
    QuestSelectorBtnComponent,
    FlagsSelectorBtnComponent,
    ItemLimitCategorySelectorBtnComponent,
    LanguageSelectorBtnComponent,
    SkillSelectorBtnComponent,
    SpellSelectorBtnComponent,
    FactionSelectorBtnComponent,
    MapSelectorBtnComponent,
    AreaSelectorBtnComponent,
    HolidaySelectorBtnComponent,
    ItemEnchantmentSelectorBtnComponent,
    IconComponent,
    Model3DViewerComponent,
  ],
})
export class ItemTemplateComponent extends SingleRowEditorComponent<ItemTemplate> implements OnInit {
  protected override readonly editorService = inject(ItemTemplateService);
  readonly handlerService = inject(ItemHandlerService);
  private readonly itemPreviewService = inject(ItemPreviewService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly ITEM_CLASS = ITEM_CLASS;
  readonly ITEM_SUBCLASS = ITEM_SUBCLASS;
  readonly ITEM_QUALITY = ITEM_QUALITY;
  readonly ITEM_FLAGS = ITEM_FLAGS;
  readonly ITEM_FLAGS_EXTRA = ITEM_FLAGS_EXTRA;
  readonly INVENTORY_TYPE = INVENTORY_TYPE;
  readonly ALLOWABLE_CLASSES = ALLOWABLE_CLASSES;
  readonly ALLOWABLE_RACES = ALLOWABLE_RACES;
  readonly FACTION_RANK = FACTION_RANK;
  readonly BAG_FAMILY = BAG_FAMILY;
  readonly SOCKET_COLOR = SOCKET_COLOR;
  readonly ITEM_BONDING = ITEM_BONDING;
  readonly ITEM_MATERIAL = ITEM_MATERIAL;
  readonly ITEM_SHEAT = ITEM_SHEAT;
  readonly TOTEM_CATEGORY = TOTEM_CATEGORY;
  readonly FOOD_TYPE = FOOD_TYPE;
  readonly ITEM_FLAGS_CUSTOM = ITEM_FLAGS_CUSTOM;
  readonly DAMAGE_TYPE = DAMAGE_TYPE;
  readonly STAT_TYPE = STAT_TYPE;
  readonly PVP_RANK = PVP_RANK;
  readonly ITEM_VIEWER_TYPE = VIEWER_TYPE.ITEM;
  readonly NPC_VIEWER_TYPE = VIEWER_TYPE.NPC;
  readonly SPELL_TRIGGERS = SPELL_TRIGGERS;

  protected showItemPreview = true;
  protected npcDisplayId: number | undefined;

  public itemPreview: SafeHtml = this.sanitizer.bypassSecurityTrustHtml('loading...');

  private async loadItemPreview(): Promise<void> {
    this.itemPreview = this.sanitizer.bypassSecurityTrustHtml(
      await this.itemPreviewService.calculatePreview(this.editorService.form.getRawValue()),
    );

    const _class = this.editorService.form.controls.class.value;
    const subclass = this.editorService.form.controls.subclass.value;
    const inventoryType = this.editorService.form.controls.InventoryType.value;
    const spellid_2 = this.editorService.form.controls.spellid_2.value;
    const spellid_1 = this.editorService.form.controls.spellid_1.value;

    const isNpc =
      _class === 15 &&
      (subclass === 5 || subclass === 2 || subclass === 0) &&
      (spellid_2 !== 0 || spellid_1 !== 0) &&
      inventoryType === InventoryType.NON_EQUIP;
    if (isNpc) {
      this.npcDisplayId = await this.itemPreviewService.getNpcDisplayIdBySpell(spellid_2 !== 0 ? spellid_2 : spellid_1);
    }

    this.changeDetectorRef.markForCheck();
  }

  private loadItemPreviewDynamic(): void {
    this.subscriptions.push(
      this.editorService.form.valueChanges
        .pipe(
          debounceTime(300),
          /* TODO */
          distinctUntilChanged(compareObjFn),
        )
        .subscribe(this.loadItemPreview.bind(this)),
    );
  }

  override ngOnInit(): void {
    super.ngOnInit();

    this.loadItemPreview();
    this.loadItemPreviewDynamic();
  }
}
