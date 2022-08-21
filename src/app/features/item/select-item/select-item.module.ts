import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { CreateModule } from '@keira-shared/modules/create/create.module';
import { HighlightjsWrapperModule } from '@keira-shared/modules/highlightjs-wrapper/highlightjs-wrapper.module';
import { IconModule } from '@keira-shared/modules/icon/icon.module';
import { QueryOutputModule } from '@keira-shared/modules/query-output/query-output.module';
import { SearchButtonsModule } from '@keira-shared/modules/search-button/search-buttons.module';
import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
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
    SearchButtonsModule,
    TranslateModule,
  ],
  exports: [SelectItemComponent],
  providers: [SelectItemService],
})
export class SelectItemModule {}
