import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { QueryOutputModule } from '@keira-shared/modules/query-output/query-output.module';
import { FactionSelectorModule } from '@keira-shared/modules/selectors/faction-selector/faction-selector.module';
import { FlagsSelectorModule } from '@keira-shared/modules/selectors/flags-selector/flags-selector.module';
import { SingleValueSelectorModule } from '@keira-shared/modules/selectors/single-value-selector/single-value-selector.module';
import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { GameobjectTemplateAddonComponent } from './gameobject-template-addon.component';
import { GameobjectTemplateAddonService } from './gameobject-template-addon.service';

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
