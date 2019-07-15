import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HighlightModule } from 'ngx-highlightjs';

import { QueryOutputComponent } from './query-output.component';
import { HighlightjsWrapperComponent } from '../hightlightjs-wrapper/highlightjs-wrapper.component';
import { QueryErrorComponent } from './query-error/query-error.component';
import { highlightOptions } from '../../../../config/highlight.config';

@NgModule({
  declarations: [
    QueryOutputComponent,
    QueryErrorComponent,
    HighlightjsWrapperComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HighlightModule.forRoot(highlightOptions),
  ],
  exports: [
    QueryOutputComponent,
    QueryErrorComponent,
  ],
})
export class QueryOutputModule {}
