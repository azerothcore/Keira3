import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { ConnectionWindowComponent } from './connection-window.component';
import { QueryOutputModule } from '../editors/shared/query-output/query-output.module';

import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    ConnectionWindowComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    QueryOutputModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (HttpLoaderFactory),
        deps: [HttpClient]
      }
    })
  ],
  exports: [
    ConnectionWindowComponent,
  ],
})
export class ConnectionWindowModule {}
