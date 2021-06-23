import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { toastrConfig } from '@keira-config/toastr.config';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
import { QueryOutputModule } from '@keira-shared/modules/query-output/query-output.module';
import { GameobjectSpawnComponent } from './gameobject-spawn.component';
import { FlagsSelectorModule } from '@keira-shared/modules/selectors/flags-selector/flags-selector.module';
import { SingleValueSelectorModule } from '@keira-shared/modules/selectors/single-value-selector/single-value-selector.module';
import { GameobjectSpawnService } from './gameobject-spawn.service';
import { MapSelectorModule } from '@keira-shared/modules/selectors/map-selector/map-selector.module';
import { AreaSelectorModule } from '@keira-shared/modules/selectors/area-selector/area-selector.module';
import { EditorButtonsModule } from '@keira-shared/modules/editor-buttons/editor-buttons.module';

@NgModule({
  declarations: [GameobjectSpawnComponent],
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
  ],
  exports: [GameobjectSpawnComponent],
  providers: [GameobjectSpawnService],
})
export class GameobjectSpawnModule {}
