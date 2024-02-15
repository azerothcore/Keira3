import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { EditorButtonsModule } from '@keira-shared/modules/editor-buttons/editor-buttons.module';
import { QueryOutputModule } from '@keira-shared/modules/query-output/query-output.module';
import { AreaSelectorModule } from '@keira-shared/modules/selectors/area-selector/area-selector.module';
import { FlagsSelectorModule } from '@keira-shared/modules/selectors/flags-selector/flags-selector.module';
import { MapSelectorModule } from '@keira-shared/modules/selectors/map-selector/map-selector.module';
import { SingleValueSelectorModule } from '@keira-shared/modules/selectors/single-value-selector/single-value-selector.module';
import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { GameobjectSpawnComponent } from './gameobject-spawn.component';
import { GameobjectSpawnService } from './gameobject-spawn.service';

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
    TranslateModule,
  ],
  exports: [GameobjectSpawnComponent],
  providers: [GameobjectSpawnService],
})
export class GameobjectSpawnModule {}
