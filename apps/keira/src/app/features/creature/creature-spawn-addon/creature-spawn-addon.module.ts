import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { CreatureSpawnAddonComponent } from './creature-spawn-addon.component';
import { CreatureSpawnAddonService } from './creature-spawn-addon.service';

@NgModule({
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TooltipModule,
    ToastrModule,
    NgxDatatableModule,
    TranslateModule,
    CreatureSpawnAddonComponent,
  ],
  exports: [CreatureSpawnAddonComponent],
  providers: [CreatureSpawnAddonService],
})
export class CreatureSpawnAddonModule {}
