import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap';

import { TopBarModule } from '../../shared/top-bar/top-bar.module';
import { QueryOutputModule } from '../../shared/query-output/query-output.module';
import { GameobjectTemplateAddonComponent } from './gameobject-template-addon.component';
import { SingleValueSelectorModule } from '../../shared/selectors/single-value-selector/single-value-selector.module';
import { FlagsSelectorModule } from '../../shared/selectors/flags-selector/flags-selector.module';

@NgModule({
  declarations: [
    GameobjectTemplateAddonComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TopBarModule,
    QueryOutputModule,
    TooltipModule.forRoot(),
    SingleValueSelectorModule,
    FlagsSelectorModule,
  ],
  exports: [
    GameobjectTemplateAddonComponent,
  ],
})
export class GameobjectTemplateAddonModule {}
