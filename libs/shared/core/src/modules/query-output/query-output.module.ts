import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { TranslateModule } from '@ngx-translate/core';
import { QueryErrorComponent } from './query-error/query-error.component';
import { QueryOutputComponent } from './query-output.component';
import { HighlightjsWrapperModule } from '../highlightjs-wrapper/highlightjs-wrapper.module';

@NgModule({
  declarations: [QueryOutputComponent, QueryErrorComponent],
  imports: [BrowserModule, FormsModule, HighlightjsWrapperModule, TranslateModule],
  exports: [QueryOutputComponent, QueryErrorComponent],
})
export class QueryOutputModule {}
