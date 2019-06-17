import 'reflect-metadata';
import '../polyfills';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import {
  PERFECT_SCROLLBAR_CONFIG,
  PerfectScrollbarConfigInterface,
  PerfectScrollbarModule
} from 'ngx-perfect-scrollbar';
import { HighlightModule } from 'ngx-highlightjs';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ClipboardModule } from 'ngx-clipboard';

import { DashboardComponent } from './components/main-window/dashboard/dashboard.component';
import { AppRoutingModule } from './config/app-routing.module';
import { ElectronService } from './services/electron.service';
import { WebviewDirective } from './directives/webview.directive';
import { AppComponent } from './components/app.component';
import { SidebarComponent } from './components/main-window/sidebar/sidebar.component';
import { MainWindowComponent } from './components/main-window/main-window.component';
import { ConnectionWindowComponent } from './components/connection-window/connection-window.component';
import { CreatureTemplateComponent } from './components/editors/creature/creature-template/creature-template.component';
import { CreatureTemplateAddonComponent } from './components/editors/creature/creature-template-addon/creature-template-addon.component';
import { NpcVendorComponent } from './components/editors/creature/npc-vendor/npc-vendor.component';
import { SelectCreatureComponent } from './components/editors/creature/select-creature/select-creature.component';
import { CreateComponent } from './components/editors/shared/create/create.component';
import { highlightOptions } from './config/highlight.config';
import { TopBarComponent } from './components/main-window/top-bar/top-bar.component';
import { QueryOutputComponent } from './components/editors/shared/query-output/query-output.component';
import { HighlightjsWrapperComponent } from './components/editors/shared/hightlightjs-wrapper/highlightjs-wrapper.component';
import { CreatureEquipTemplateComponent } from './components/editors/creature/creature-equip-template/creature-equip-template.component';
import {
  CreatureOnkillReputationComponent
} from './components/editors/creature/creature-onkill-reputation/creature-onkill-reputation.component';
import { MysqlService } from './services/mysql.service';
import { CreatureQuestitemComponent } from './components/editors/creature/creature-questitem/creature-questitem.component';
import { CreatureLootTemplateComponent } from './components/editors/creature/creature-loot-template/creature-loot-template.component';
import {
  PickpocketingLootTemplateComponent
} from './components/editors/creature/pickpocketing-loot-template/pickpocketing-loot-template.component';
import { SkinningLootTemplateComponent } from './components/editors/creature/skinning-loot-template/skinning-loot-template.component';
import { NpcTrainerComponent } from './components/editors/creature/npc-trainer/npc-trainer.component';
import { SpawnsComponent } from './components/editors/creature/spawns/spawns.component';
import { SpawnsAddonComponent } from './components/editors/creature/spawns-addon/spawns-addon.component';
import { QueryErrorComponent } from './components/editors/shared/query-output/query-error/query-error.component';
import { SelectorButtonComponent } from './components/editors/shared/selectors/selector-button/selector-button.component';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    WebviewDirective,
    SidebarComponent,
    MainWindowComponent,
    ConnectionWindowComponent,
    /* Creature */
    CreatureTemplateComponent,
    CreatureTemplateAddonComponent,
    NpcVendorComponent,
    SelectCreatureComponent,
    CreateComponent,
    TopBarComponent,
    QueryOutputComponent,
    HighlightjsWrapperComponent,
    CreatureEquipTemplateComponent,
    CreatureOnkillReputationComponent,
    CreatureQuestitemComponent,
    CreatureLootTemplateComponent,
    PickpocketingLootTemplateComponent,
    SkinningLootTemplateComponent,
    NpcTrainerComponent,
    SpawnsComponent,
    SpawnsAddonComponent,
    QueryErrorComponent,
    SelectorButtonComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    BsDropdownModule.forRoot(),
    PerfectScrollbarModule,
    HighlightModule.forRoot(highlightOptions),
    NgxDatatableModule,
    ClipboardModule,
  ],
  providers: [
    ElectronService,
    MysqlService,
    { provide: PERFECT_SCROLLBAR_CONFIG, useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
