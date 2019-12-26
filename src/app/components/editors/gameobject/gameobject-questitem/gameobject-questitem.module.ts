import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ToastrModule } from 'ngx-toastr';

import { TopBarModule } from '../../shared/top-bar/top-bar.module';
import { QueryOutputModule } from '../../shared/query-output/query-output.module';
import { GameobjectQuestitemComponent } from './gameobject-questitem.component';
import { ItemSelectorModule } from '../../shared/selectors/item-selector/item-selector.module';

@NgModule({
  declarations: [
    GameobjectQuestitemComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TopBarModule,
    QueryOutputModule,
    NgxDatatableModule,
    ItemSelectorModule,
    ToastrModule.forRoot(),
  ],
  exports: [
    GameobjectQuestitemComponent,
  ],
})
export class GameobjectQuestitemModule {}
