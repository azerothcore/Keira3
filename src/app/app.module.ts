import 'reflect-metadata';
import '../polyfills';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './config/app-routing.module';
import { AppComponent } from './main/app.component';
import { ConnectionWindowModule } from './main/connection-window/connection-window.module';
import { DashboardModule } from './features/dashboard/dashboard.module';
import { MainWindowModule } from './main/main-window/main-window.module';
import { CreatureModule } from './features/creature/creature.module';
import { QuestModule } from './features/quest/quest.module';
import { GameobjectModule } from './features/gameobject/gameobject.module';
import { ItemModule } from './features/item/item.module';
import { GossipModule } from './features/gossip/gossip.module';
import { ConditionsModule } from './features/conditions/conditions.module';
import { SmartScriptsModule } from './features/smart-scripts/smart-scripts.module';
import { SqlEditorModule } from './features/sql-editor/sql-editor.module';

@NgModule({
  declarations: [ AppComponent ],
  imports: [
    BrowserModule,
    /* Misc */
    AppRoutingModule,
    ConnectionWindowModule,
    DashboardModule,
    MainWindowModule,
    /* Editors */
    SqlEditorModule,
    CreatureModule,
    QuestModule,
    GameobjectModule,
    ItemModule,
    GossipModule,
    ConditionsModule,
    SmartScriptsModule,
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
