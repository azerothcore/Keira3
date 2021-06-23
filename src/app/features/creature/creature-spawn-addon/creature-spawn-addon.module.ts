import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { toastrConfig } from '@keira-config/toastr.config';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
import { QueryOutputModule } from '@keira-shared/modules/query-output/query-output.module';
import { CreatureSpawnAddonComponent } from './creature-spawn-addon.component';
import { SingleValueSelectorModule } from '@keira-shared/modules/selectors/single-value-selector/single-value-selector.module';
import { CreatureSpawnAddonService } from './creature-spawn-addon.service';

@NgModule({
  declarations: [CreatureSpawnAddonComponent],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TopBarModule,
    QueryOutputModule,
    TooltipModule,
    ToastrModule,
    NgxDatatableModule,
    SingleValueSelectorModule,
  ],
  exports: [CreatureSpawnAddonComponent],
  providers: [CreatureSpawnAddonService],
})
export class CreatureSpawnAddonModule {}
