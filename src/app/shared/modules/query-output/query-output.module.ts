import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { HighlightjsWrapperModule } from '@keira-shared/modules/highlightjs-wrapper/highlightjs-wrapper.module';
import { QueryOutputComponent } from './query-output.component';
import { QueryErrorComponent } from './query-error/query-error.component';

@NgModule({
  declarations: [QueryOutputComponent, QueryErrorComponent],
  imports: [BrowserModule, FormsModule, HighlightjsWrapperModule],
  exports: [QueryOutputComponent, QueryErrorComponent],
})
export class QueryOutputModule {}
