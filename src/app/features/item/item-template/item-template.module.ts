import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { IconModule } from '@keira-shared/modules/icon/icon.module';
import { QueryOutputModule } from '@keira-shared/modules/query-output/query-output.module';
import { AreaSelectorModule } from '@keira-shared/modules/selectors/area-selector/area-selector.module';
import { FactionSelectorModule } from '@keira-shared/modules/selectors/faction-selector/faction-selector.module';
import { FlagsSelectorModule } from '@keira-shared/modules/selectors/flags-selector/flags-selector.module';
import { HolidaySelectorModule } from '@keira-shared/modules/selectors/holiday-selector/holiday-selector.module';
import { ItemEnchantmentSelectorModule } from '@keira-shared/modules/selectors/item-enchantment-selector/item-enchantment-selector.module';
import { ItemLimitCategorySelectorModule } from '@keira-shared/modules/selectors/item-limit-category-selector/item-limit-category-selector.module';
import { LanguageSelectorModule } from '@keira-shared/modules/selectors/language-selector/language-selector.module';
import { MapSelectorModule } from '@keira-shared/modules/selectors/map-selector/map-selector.module';
import { QuestSelectorModule } from '@keira-shared/modules/selectors/quest-selector/quest-selector.module';
import { SingleValueSelectorModule } from '@keira-shared/modules/selectors/single-value-selector/single-value-selector.module';
import { SkillSelectorModule } from '@keira-shared/modules/selectors/skill-selector/skill-selector.module';
import { SpellSelectorModule } from '@keira-shared/modules/selectors/spell-selector/spell-selector.module';
import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { ToastrModule } from 'ngx-toastr';
import { ItemPreviewService } from './item-preview.service';
import { ItemTemplateComponent } from './item-template.component';
import { ItemTemplateService } from './item-template.service';

@NgModule({
  declarations: [ItemTemplateComponent],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TopBarModule,
    QueryOutputModule,
    TooltipModule,
    ToastrModule,
    PerfectScrollbarModule,
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
  ],
  exports: [ItemTemplateComponent],
  providers: [ItemTemplateService, ItemPreviewService],
})
export class ItemTemplateModule {}
