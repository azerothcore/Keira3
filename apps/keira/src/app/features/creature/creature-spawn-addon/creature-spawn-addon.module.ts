import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { QueryOutputModule, SingleValueSelectorModule, TopBarModule } from '@keira/core';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { CreatureSpawnAddonComponent } from './creature-spawn-addon.component';
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
    TranslateModule,
  ],
  exports: [CreatureSpawnAddonComponent],
  providers: [CreatureSpawnAddonService],
})
export class CreatureSpawnAddonModule {}
