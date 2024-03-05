import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { CreateModule, HighlightjsWrapperModule, QueryOutputModule, TopBarModule } from '@keira/shared/core';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SelectQuestComponent } from './select-quest.component';
import { SelectQuestService } from './select-quest.service';

@NgModule({
  declarations: [SelectQuestComponent],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TopBarModule,
    QueryOutputModule,
    CreateModule,
    HighlightjsWrapperModule,
    NgxDatatableModule,
    TranslateModule,
  ],
  exports: [SelectQuestComponent],
  providers: [SelectQuestService],
})
export class SelectQuestModule {}
