import { enableProdMode, importProvidersFrom, provideZonelessChangeDetection } from '@angular/core';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, withHashLocation } from '@angular/router';
import { KEIRA_APP_CONFIG_TOKEN, highlightOptions, toastrConfig, uiSwitchConfig } from '@keira/shared/config';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { HIGHLIGHT_OPTIONS } from 'ngx-highlightjs';
import { ToastrModule } from 'ngx-toastr';
import { UiSwitchModule } from 'ngx-ui-switch';
import { AppComponent } from './app/app.component';
import { KEIRA_ROUTES } from './app/routes';
import { KEIRA_APP_CONFIG } from './environments/environment';

if (KEIRA_APP_CONFIG.production) {
  enableProdMode();
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
    ),
    provideTranslateService({
      loader: provideTranslateHttpLoader({ prefix: './assets/i18n/', suffix: '.json' }),
      fallbackLang: 'en',
    }),
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
