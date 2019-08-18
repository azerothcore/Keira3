import 'reflect-metadata';
import '../polyfills';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './config/app-routing.module';
import { AppComponent } from './components/app.component';
import { CreatureModule } from './components/editors/creature/creature.module';
import { ConnectionWindowModule } from './components/connection-window/connection-window.module';
import { DashboardModule } from './components/editors/dashboard/dashboard.module';
import { MainWindowModule } from './components/main-window/main-window.module';
import { ComingSoonModule } from './components/editors/coming-soon/coming-soon.module';
import { QuestModule } from './components/editors/quest/quest.module';
import { GameobjectModule } from './components/editors/gameobject/gameobject.module';
import { ItemModule } from './components/editors/item/item.module';


@NgModule({
  declarations: [ AppComponent ],
  imports: [
    BrowserModule,
    /* Misc */
    AppRoutingModule,
    ConnectionWindowModule,
    ComingSoonModule,
    DashboardModule,
    MainWindowModule,
    /* Editors */
    CreatureModule,
    QuestModule,
    GameobjectModule,
    ItemModule,
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
