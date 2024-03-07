import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { GameobjectSpawnAddonComponent } from './gameobject-spawn-addon.component';
import { GameobjectSpawnAddonService } from './gameobject-spawn-addon.service';

@NgModule({
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TooltipModule,
    ToastrModule,
    NgxDatatableModule,
    TranslateModule,
    GameobjectSpawnAddonComponent,
  ],
  exports: [GameobjectSpawnAddonComponent],
  providers: [GameobjectSpawnAddonService],
})
export class GameobjectSpawnAddonModule {}
