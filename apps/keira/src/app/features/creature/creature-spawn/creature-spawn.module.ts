import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import {
  AreaSelectorModule,
  EditorButtonsModule,
  FlagsSelectorModule,
  MapSelectorModule,
  QueryOutputModule,
  SingleValueSelectorModule,
  TopBarModule,
} from '@keira/shared/core';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { CreatureSpawnComponent } from './creature-spawn.component';
import { CreatureSpawnService } from './creature-spawn.service';

@NgModule({
  declarations: [CreatureSpawnComponent],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TopBarModule,
    QueryOutputModule,
    TooltipModule,
    ToastrModule,
    NgxDatatableModule,
    FlagsSelectorModule,
    SingleValueSelectorModule,
    MapSelectorModule,
    AreaSelectorModule,
    EditorButtonsModule,
    TranslateModule,
  ],
  exports: [CreatureSpawnComponent],
  providers: [CreatureSpawnService],
})
export class CreatureSpawnModule {}
