import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SingleRowEditorComponent } from '@keira/shared/core';
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
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { VIEWER_TYPE, Model3DViewerComponent } from '@keira/shared/model-3d-viewer';
import { ItemHandlerService } from '../item-handler.service';
import { SPELL_TRIGGERS } from './item-constants';
import { ItemPreviewService } from './item-preview.service';
import { ItemTemplateService } from './item-template.service';
import { IconComponent } from '@keira/shared/core';
import { ItemEnchantmentSelectorBtnComponent } from '@keira/shared/core';
import { HolidaySelectorBtnComponent } from '@keira/shared/core';
import { AreaSelectorBtnComponent } from '@keira/shared/core';
import { MapSelectorBtnComponent } from '@keira/shared/core';
import { FactionSelectorBtnComponent } from '@keira/shared/core';
import { SpellSelectorBtnComponent } from '@keira/shared/core';
import { SkillSelectorBtnComponent } from '@keira/shared/core';
import { LanguageSelectorBtnComponent } from '@keira/shared/core';
import { ItemLimitCategorySelectorBtnComponent } from '@keira/shared/core';
import { FlagsSelectorBtnComponent } from '@keira/shared/core';
import { QuestSelectorBtnComponent } from '@keira/shared/core';
import { SingleValueSelectorBtnComponent } from '@keira/shared/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QueryOutputComponent } from '@keira/shared/core';
import { TranslateModule } from '@ngx-translate/core';
import { NgClass, NgIf, NgFor } from '@angular/common';
import { TopBarComponent } from '@keira/shared/core';

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'keira-item-template',
  templateUrl: './item-template.component.html',
  styleUrls: ['./item-template.component.scss'],
  standalone: true,
  imports: [
    TopBarComponent,
    NgClass,
    NgIf,
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
    NgFor,
    ItemEnchantmentSelectorBtnComponent,
    IconComponent,
    Model3DViewerComponent,
  ],
})
export class ItemTemplateComponent extends SingleRowEditorComponent<ItemTemplate> implements OnInit {
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
  readonly SPELL_TRIGGERS = SPELL_TRIGGERS;

  showItemPreview = true;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: ItemTemplateService,
    public handlerService: ItemHandlerService,
    private readonly itemPreviewService: ItemPreviewService,
    private readonly sanitizer: DomSanitizer,
  ) {
    super(editorService, handlerService);
  }

  public itemPreview: SafeHtml = this.sanitizer.bypassSecurityTrustHtml('loading...');

  private async loadItemPreview(): Promise<void> {
    this.itemPreview = this.sanitizer.bypassSecurityTrustHtml(
      await this.itemPreviewService.calculatePreview(this.editorService.form.getRawValue()),
    );
    this.changeDetectorRef.markForCheck();
  }

  private loadItemPreviewDynamic(): void {
    this.subscriptions.push(
      this.editorService.form.valueChanges
        .pipe(
          debounceTime(600),
          /* TODO */
          distinctUntilChanged(
            /* istanbul ignore next */
            (a, b) => JSON.stringify(a) === JSON.stringify(b),
          ),
        )
        .subscribe(this.loadItemPreview.bind(this)),
    );
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.loadItemPreview();
    this.loadItemPreviewDynamic();
  }
}
