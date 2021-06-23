import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { HighlightjsWrapperModule } from '@keira-shared/modules/highlightjs-wrapper/highlightjs-wrapper.module';

import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
import { QueryOutputModule } from '@keira-shared/modules/query-output/query-output.module';
import { SelectGameobjectComponent } from './select-gameobject.component';
import { CreateModule } from '@keira-shared/modules/create/create.module';
import { SelectGameobjectService } from './select-gameobject.service';
import { SearchButtonsModule } from '@keira-shared/modules/search-button/search-buttons.module';

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
    SearchButtonsModule,
  ],
  exports: [SelectGameobjectComponent],
  providers: [SelectGameobjectService],
})
export class SelectGameobjectModule {}
