import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { TopBarModule } from '../../shared/top-bar/top-bar.module';
import { QueryOutputModule } from '../../shared/query-output/query-output.module';
import { SpawnsAddonComponent } from './spawns-addon.component';
import { SingleValueSelectorModule } from '../../shared/selectors/single-value-selector/single-value-selector.module';

@NgModule({
  declarations: [
    SpawnsAddonComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TopBarModule,
    QueryOutputModule,
    TooltipModule.forRoot(),
    NgxDatatableModule,
    SingleValueSelectorModule,
  ],
  exports: [
    SpawnsAddonComponent,
  ],
})
export class SpawnsAddonModule {}
