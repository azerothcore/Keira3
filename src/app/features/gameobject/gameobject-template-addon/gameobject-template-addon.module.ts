import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { toastrConfig } from '@keira-config/toastr.config';

import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
import { QueryOutputModule } from '@keira-shared/modules/query-output/query-output.module';
import { GameobjectTemplateAddonComponent } from './gameobject-template-addon.component';
import { SingleValueSelectorModule } from '@keira-shared/modules/selectors/single-value-selector/single-value-selector.module';
import { FlagsSelectorModule } from '@keira-shared/modules/selectors/flags-selector/flags-selector.module';
import { GameobjectTemplateAddonService } from './gameobject-template-addon.service';
import { FactionSelectorModule } from '@keira-shared/modules/selectors/faction-selector/faction-selector.module';

@NgModule({
  declarations: [GameobjectTemplateAddonComponent],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TopBarModule,
    QueryOutputModule,
    TooltipModule,
    ToastrModule,
    SingleValueSelectorModule,
    FlagsSelectorModule,
    FactionSelectorModule,
  ],
  exports: [GameobjectTemplateAddonComponent],
  providers: [GameobjectTemplateAddonService],
})
export class GameobjectTemplateAddonModule {}
