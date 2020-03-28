import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap';
import { ToastrModule } from 'ngx-toastr';
import { toastrConfig } from '@keira-config/toastr.config';

import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
import { QueryOutputModule } from '@keira-shared/modules/query-output/query-output.module';
import { ItemTemplateComponent } from './item-template.component';
import { SingleValueSelectorModule } from '@keira-shared/modules/selectors/single-value-selector/single-value-selector.module';
import { FlagsSelectorModule } from '@keira-shared/modules/selectors/flags-selector/flags-selector.module';
import { ItemTemplateService } from './item-template.service';
import { SpellSelectorModule } from '@keira-shared/modules/selectors/spell-selector/spell-selector.module';
import { FactionSelectorModule } from '@keira-shared/modules/selectors/faction-selector/faction-selector.module';
import { MapSelectorModule } from '@keira-shared/modules/selectors/map-selector/map-selector.module';
import { AreaSelectorModule } from '@keira-shared/modules/selectors/area-selector/area-selector.module';

@NgModule({
  declarations: [
    ItemTemplateComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TopBarModule,
    QueryOutputModule,
    TooltipModule.forRoot(),
    ToastrModule.forRoot(toastrConfig),
    SingleValueSelectorModule,
    FlagsSelectorModule,
    SpellSelectorModule,
    FactionSelectorModule,
    MapSelectorModule,
    AreaSelectorModule,
  ],
  exports: [
    ItemTemplateComponent,
  ],
  providers: [
    ItemTemplateService,
  ],
})
export class ItemTemplateModule {}
