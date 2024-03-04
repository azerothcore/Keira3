import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { EditorButtonsModule, IconModule, ItemSelectorModule, QueryOutputModule, TopBarModule } from '@keira/shared/core';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ToastrModule } from 'ngx-toastr';
import { CreatureQuestitemComponent } from './creature-questitem.component';
import { CreatureQuestitemService } from './creature-questitem.service';

@NgModule({
  declarations: [CreatureQuestitemComponent],
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
  exports: [CreatureQuestitemComponent],
  providers: [CreatureQuestitemService],
})
export class CreatureQuestitemModule {}
