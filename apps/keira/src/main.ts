import { enableProdMode, importProvidersFrom } from '@angular/core';

import { KEIRA_APP_CONFIG } from './environments/environment';
import { AppComponent } from './app/main/app.component';
import { SpellModule } from './app/features/spell/spell.module';
import { ConditionsModule } from './app/features/conditions/conditions.module';
import { GossipModule } from './app/features/gossip/gossip.module';
import { ItemModule } from './app/features/item/item.module';
import { GameobjectModule } from './app/features/gameobject/gameobject.module';
import { QuestModule } from './app/features/quest/quest.module';
import { CreatureModule } from './app/features/creature/creature.module';
import { SqlEditorModule } from './app/features/sql-editor/sql-editor.module';
import { MainWindowModule } from './app/main/main-window/main-window.module';
import { ConnectionWindowModule } from './app/main/connection-window/connection-window.module';
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
import { provideRouter, RouterHashLocationFeature, withHashLocation } from '@angular/router';
import { KEIRA_ROUTES } from './app/routes';

if (KEIRA_APP_CONFIG.production) {
  enableProdMode();
}

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(KEIRA_ROUTES, withHashLocation()),
    importProvidersFrom(
      BrowserModule,
      /* Libraries */
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
      /* Misc */
      ConnectionWindowModule,
      MainWindowModule,
      /* Editors */
      SqlEditorModule,
      CreatureModule,
      QuestModule,
      GameobjectModule,
      ItemModule,
      GossipModule,
      ConditionsModule,
      SpellModule,
    ),
    { provide: KEIRA_APP_CONFIG_TOKEN, useValue: KEIRA_APP_CONFIG },
    {
      provide: HIGHLIGHT_OPTIONS,
      useValue: highlightOptions,
    },
    provideHttpClient(withInterceptorsFromDi()),
  ],
}).catch((err) => console.error(err));
