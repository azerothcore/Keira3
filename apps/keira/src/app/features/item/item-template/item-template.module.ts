import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import {
  AreaSelectorModule,
  FactionSelectorModule,
  FlagsSelectorModule,
  HolidaySelectorModule,
  IconModule,
  ItemEnchantmentSelectorModule,
  ItemLimitCategorySelectorModule,
  LanguageSelectorModule,
  MapSelectorModule,
  QueryOutputModule,
  QuestSelectorModule,
  SingleValueSelectorModule,
  SkillSelectorModule,
  SpellSelectorModule,
  TopBarModule,
} from '@keira/shared/core';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { ItemPreviewService } from './item-preview.service';
import { ItemTemplateComponent } from './item-template.component';
import { ItemTemplateService } from './item-template.service';
import { Model3DViewerModule } from '../../model-3d-viewer/model-3d-viewer.module';

@NgModule({
  declarations: [ItemTemplateComponent],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TopBarModule,
    QueryOutputModule,
    TooltipModule,
    ToastrModule,
    SingleValueSelectorModule,
    FlagsSelectorModule,
    SpellSelectorModule,
    FactionSelectorModule,
    MapSelectorModule,
    AreaSelectorModule,
    ItemEnchantmentSelectorModule,
    HolidaySelectorModule,
    LanguageSelectorModule,
    ItemLimitCategorySelectorModule,
    QuestSelectorModule,
    SkillSelectorModule,
    IconModule,
    TranslateModule,
    Model3DViewerModule,
  ],
  exports: [ItemTemplateComponent],
  providers: [ItemTemplateService, ItemPreviewService],
})
export class ItemTemplateModule {}
