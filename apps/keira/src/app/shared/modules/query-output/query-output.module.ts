import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { HighlightjsWrapperModule } from '@keira-shared/modules/highlightjs-wrapper/highlightjs-wrapper.module';
import { TranslateModule } from '@ngx-translate/core';
import { QueryErrorComponent } from './query-error/query-error.component';
import { QueryOutputComponent } from './query-output.component';

@NgModule({
  declarations: [QueryOutputComponent, QueryErrorComponent],
  imports: [BrowserModule, FormsModule, HighlightjsWrapperModule, TranslateModule],
  exports: [QueryOutputComponent, QueryErrorComponent],
})
export class QueryOutputModule {}
