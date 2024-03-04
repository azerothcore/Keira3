import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { QueryOutputModule, SingleValueSelectorModule, TopBarModule } from '@keira/shared/core';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { GameobjectSpawnAddonComponent } from './gameobject-spawn-addon.component';
import { GameobjectSpawnAddonService } from './gameobject-spawn-addon.service';

@NgModule({
  declarations: [GameobjectSpawnAddonComponent],
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
  exports: [GameobjectSpawnAddonComponent],
  providers: [GameobjectSpawnAddonService],
})
export class GameobjectSpawnAddonModule {}
