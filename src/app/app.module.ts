import 'reflect-metadata';
import '../polyfills';
import { NgModule } from '@angular/core';
import {
PERFECT_SCROLLBAR_CONFIG,
PerfectScrollbarConfigInterface,
PerfectScrollbarModule
} from 'ngx-perfect-scrollbar';
import { ClipboardModule } from 'ngx-clipboard';

import { DashboardComponent } from './components/main-window/dashboard/dashboard.component';
import { AppRoutingModule } from './config/app-routing.module';
import { ElectronService } from './services/electron.service';
import { WebviewDirective } from './directives/webview.directive';
import { AppComponent } from './components/app.component';
import { SidebarComponent } from './components/main-window/sidebar/sidebar.component';
import { MainWindowComponent } from './components/main-window/main-window.component';
import { ConnectionWindowComponent } from './components/connection-window/connection-window.component';
import { CreateComponent } from './components/editors/shared/create/create.component';
import { TopBarComponent } from './components/main-window/top-bar/top-bar.component';
import { QueryOutputComponent } from './components/editors/shared/query-output/query-output.component';
import { HighlightjsWrapperComponent } from './components/editors/shared/hightlightjs-wrapper/highlightjs-wrapper.component';
import { MysqlService } from './services/mysql.service';
import { QueryErrorComponent } from './components/editors/shared/query-output/query-error/query-error.component';
import { ComingSoonComponent } from './components/editors/coming-soon/coming-soon.component';
import { CreatureModule } from './components/editors/creature/creature.module';
import { ConnectionWindowModule } from './components/connection-window/connection-window.module';
import { DashboardModule } from './components/main-window/dashboard/dashboard.module';

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
    QueryErrorComponent,
    HighlightjsWrapperComponent,
    CreateComponent,
    TopBarComponent,
    ConnectionWindowComponent,
    QueryOutputComponent,
    ComingSoonComponent,
  ],
  imports: [
    /* Misc */
    AppRoutingModule,
    ConnectionWindowModule,
    DashboardModule,
    /* Editors */
    CreatureModule,

    PerfectScrollbarModule,
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
