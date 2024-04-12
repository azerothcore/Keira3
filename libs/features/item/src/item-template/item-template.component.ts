import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SingleRowEditorComponent } from '@keira/shared/base-abstract-classes';
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
import { Model3DViewerComponent, VIEWER_TYPE } from '@keira/shared/model-3d-viewer';
import { ItemHandlerService } from '../item-handler.service';
import { SPELL_TRIGGERS } from './item-constants';
import { ItemPreviewService } from './item-preview.service';
import { ItemTemplateService } from './item-template.service';
import { IconComponent, QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
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
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NgClass } from '@angular/common';

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
  readonly editorService = inject(ItemTemplateService);
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
  readonly SPELL_TRIGGERS = SPELL_TRIGGERS;

  showItemPreview = true;

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
