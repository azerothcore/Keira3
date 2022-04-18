import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { HighlightjsWrapperModule } from '@keira-shared/modules/highlightjs-wrapper/highlightjs-wrapper.module';
import { QueryOutputModule } from '@keira-shared/modules/query-output/query-output.module';
import { SearchButtonsModule } from '@keira-shared/modules/search-button/search-buttons.module';
import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SaiSearchExistingComponent } from './sai-search-existing.component';

@NgModule({
  declarations: [SaiSearchExistingComponent],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TopBarModule,
    QueryOutputModule,
    HighlightjsWrapperModule,
    NgxDatatableModule,
    SearchButtonsModule,
  ],
  exports: [SaiSearchExistingComponent],
})
export class SaiSearchExistingModule {}
