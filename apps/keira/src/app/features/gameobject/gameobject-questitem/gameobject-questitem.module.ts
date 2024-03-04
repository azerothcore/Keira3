import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { EditorButtonsModule, IconModule, ItemSelectorModule, QueryOutputModule, TopBarModule } from '@keira/shared/core';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ToastrModule } from 'ngx-toastr';
import { GameobjectQuestitemComponent } from './gameobject-questitem.component';
import { GameobjectQuestitemService } from './gameobject-questitem.service';

@NgModule({
  declarations: [GameobjectQuestitemComponent],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TopBarModule,
    QueryOutputModule,
    NgxDatatableModule,
    ItemSelectorModule,
    ToastrModule,
    IconModule,
    EditorButtonsModule,
    TranslateModule,
  ],
  exports: [GameobjectQuestitemComponent],
  providers: [GameobjectQuestitemService],
})
export class GameobjectQuestitemModule {}
