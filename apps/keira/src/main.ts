import { enableProdMode, importProvidersFrom, provideZonelessChangeDetection } from '@angular/core';

import { KEIRA_APP_CONFIG } from './environments/environment';
import { AppComponent } from './app/app.component';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { UiSwitchModule } from 'ngx-ui-switch';
import { ToastrModule } from 'ngx-toastr';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ModalModule } from 'ngx-bootstrap/modal';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { withInterceptorsFromDi, provideHttpClient, HttpClient } from '@angular/common/http';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { HIGHLIGHT_OPTIONS } from 'ngx-highlightjs';
import { KEIRA_APP_CONFIG_TOKEN, highlightOptions, toastrConfig, uiSwitchConfig } from '@keira/shared/config';
import { provideRouter, withHashLocation } from '@angular/router';
import { KEIRA_ROUTES } from './app/routes';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

if (KEIRA_APP_CONFIG.production) {
  enableProdMode();
}

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    importProvidersFrom(
      /* Angular */
      BrowserModule,
      BrowserAnimationsModule,
      ReactiveFormsModule,
      FormsModule,
      /* External Libraries */
      BsDropdownModule.forRoot(),
      ModalModule.forRoot(),
      TabsModule.forRoot(),
      TooltipModule.forRoot(),
      ToastrModule.forRoot(toastrConfig),
      UiSwitchModule.forRoot(uiSwitchConfig),
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: createTranslateLoader,
          deps: [HttpClient],
        },
        defaultLanguage: 'en',
      }),
    ),
    /* Config */
    provideRouter(KEIRA_ROUTES, withHashLocation()),
    { provide: KEIRA_APP_CONFIG_TOKEN, useValue: KEIRA_APP_CONFIG },
    {
      provide: HIGHLIGHT_OPTIONS,
      useValue: highlightOptions,
    },
    provideHttpClient(withInterceptorsFromDi()),
  ],
}).catch((err) => console.error(err));
