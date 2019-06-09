import 'reflect-metadata';
import '../polyfills';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { BsDropdownModule } from 'ngx-bootstrap';
import {
  PERFECT_SCROLLBAR_CONFIG,
  PerfectScrollbarConfigInterface,
  PerfectScrollbarModule
} from 'ngx-perfect-scrollbar';
import { HighlightModule } from 'ngx-highlightjs';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ClipboardModule } from 'ngx-clipboard';

import { HomeComponent } from './components/main-window/home/home.component';
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
import { CreateComponent } from './components/editors/create/create.component';
import { highlightOptions } from './highlight.config';
import { TopBarComponent } from './components/main-window/top-bar/top-bar.component';
import { QueryOutputComponent } from './components/editors/query-output/query-output.component';
import { HighlightjsWrapperComponent } from './components/editors/hightlightjs-wrapper/highlightjs-wrapper.component';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
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
    { provide: PERFECT_SCROLLBAR_CONFIG, useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
