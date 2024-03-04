import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { CreateModule, HighlightjsWrapperModule, QueryOutputModule, TopBarModule } from '@keira/core';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SelectConditionsComponent } from './select-conditions.component';

@NgModule({
  declarations: [SelectConditionsComponent],
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
  exports: [SelectConditionsComponent],
})
export class SelectConditionsModule {}
