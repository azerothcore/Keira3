import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { TopBarModule } from '../../../shared/modules/top-bar/top-bar.module';
import { QueryOutputModule } from '../../../shared/modules/query-output/query-output.module';
import { GameobjectQueststarterComponent } from './gameobject-queststarter.component';
import { TooltipModule } from 'ngx-bootstrap';
import { ToastrModule } from 'ngx-toastr';
import { toastrConfig } from '../../../config/toastr.config';
import { GameobjectSelectorModule } from '../../../shared/modules/selectors/gameobject-selector/gameobject-selector.module';

@NgModule({
  declarations: [
    GameobjectQueststarterComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TopBarModule,
    QueryOutputModule,
    NgxDatatableModule,
    TooltipModule.forRoot(),
    ToastrModule.forRoot(toastrConfig),
    GameobjectSelectorModule,
  ],
  exports: [
    GameobjectQueststarterComponent,
  ],
})
export class GameobjectQueststarterModule {}
