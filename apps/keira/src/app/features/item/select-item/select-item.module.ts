import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { CreateModule, HighlightjsWrapperModule, IconModule, QueryOutputModule, TopBarModule } from '@keira/shared/core';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SelectItemComponent } from './select-item.component';
import { SelectItemService } from './select-item.service';

@NgModule({
  declarations: [SelectItemComponent],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TopBarModule,
    QueryOutputModule,
    CreateModule,
    HighlightjsWrapperModule,
    NgxDatatableModule,
    IconModule,
    TranslateModule,
  ],
  exports: [SelectItemComponent],
  providers: [SelectItemService],
})
export class SelectItemModule {}
