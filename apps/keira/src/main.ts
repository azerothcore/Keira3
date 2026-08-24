import { enableProdMode, importProvidersFrom, provideZonelessChangeDetection } from '@angular/core';

import { provideHttpClient, withInterceptorsFromDi, withInterceptors } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, withHashLocation } from '@angular/router';
import { KEIRA_APP_CONFIG_TOKEN, highlightOptions, isWebLikeEnvironment, toastrConfig, uiSwitchConfig } from '@keira/shared/config';
import { webAuth401Interceptor } from '@keira/shared/login-config';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { HIGHLIGHT_OPTIONS } from 'ngx-highlightjs';
import { ToastrModule } from 'ngx-toastr';
import { UiSwitchModule } from 'ngx-ui-switch';
import { AppComponent } from './app/app.component';
import { KEIRA_ROUTES } from './app/routes';
import { KEIRA_APP_CONFIG } from './environments/environment';
// eslint-disable-next-line @nx/enforce-module-boundaries
import packageInfo from '../../../package.json';

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
      ToastrModule.forRoot(toastrConfig),
      UiSwitchModule.forRoot(uiSwitchConfig),
    ),
    provideTranslateService({
      // Version query busts translation files cached before nginx sent Cache-Control
      loader: provideTranslateHttpLoader({ prefix: './assets/i18n/', suffix: `.json?v=${packageInfo.version}` }),
      fallbackLang: 'en',
    }),
    /* Config */
    provideRouter(KEIRA_ROUTES, withHashLocation()),
    { provide: KEIRA_APP_CONFIG_TOKEN, useValue: KEIRA_APP_CONFIG },
    {
      provide: HIGHLIGHT_OPTIONS,
      useValue: highlightOptions,
    },
    provideHttpClient(withInterceptorsFromDi(), withInterceptors(isWebLikeEnvironment(KEIRA_APP_CONFIG) ? [webAuth401Interceptor] : [])),
  ],
}).catch((err) => console.error(err));
