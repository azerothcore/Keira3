import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { TopBarModule } from '../../shared/top-bar/top-bar.module';
import { QueryOutputModule } from '../../shared/query-output/query-output.module';
import { GameobjectQueststarterComponent } from './gameobject-queststarter.component';
import { TooltipModule } from 'ngx-bootstrap';
import { GameobjectSelectorModule } from '../../shared/selectors/gameobject-selector/gameobject-selector.module';

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
    GameobjectSelectorModule,
  ],
  exports: [
    GameobjectQueststarterComponent,
  ],
})
export class GameobjectQueststarterModule {}
