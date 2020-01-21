import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ToastrModule } from 'ngx-toastr';
import { toastrConfig } from '../../../config/toastr.config';

import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
import { QueryOutputModule } from '@keira-shared/modules/query-output/query-output.module';
import { GameobjectQuestitemComponent } from './gameobject-questitem.component';
import { ItemSelectorModule } from '@keira-shared/modules/selectors/item-selector/item-selector.module';

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
    ToastrModule.forRoot(toastrConfig),
  ],
  exports: [
    GameobjectQuestitemComponent,
  ],
})
export class GameobjectQuestitemModule {}
