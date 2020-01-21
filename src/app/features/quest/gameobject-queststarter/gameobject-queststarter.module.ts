import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
import { QueryOutputModule } from '@keira-shared/modules/query-output/query-output.module';
import { GameobjectQueststarterComponent } from './gameobject-queststarter.component';
import { TooltipModule } from 'ngx-bootstrap';
import { ToastrModule } from 'ngx-toastr';
import { toastrConfig } from '@keira-config/toastr.config';
import { GameobjectSelectorModule } from '@keira-shared/modules/selectors/gameobject-selector/gameobject-selector.module';
import { GameobjectQueststarterService } from './gameobject-queststarter.service';

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
  providers: [
    GameobjectQueststarterService,
  ],
})
export class GameobjectQueststarterModule {}
