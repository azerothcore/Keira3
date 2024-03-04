import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { CreateModule, HighlightjsWrapperModule, QueryOutputModule, TopBarModule } from '@keira/core';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SelectGameobjectComponent } from './select-gameobject.component';
import { SelectGameobjectService } from './select-gameobject.service';

@NgModule({
  declarations: [SelectGameobjectComponent],
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
  exports: [SelectGameobjectComponent],
  providers: [SelectGameobjectService],
})
export class SelectGameobjectModule {}
