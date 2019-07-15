import 'reflect-metadata';
import '../polyfills';
import { NgModule } from '@angular/core';

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
import { SidebarModule } from './components/main-window/sidebar/sidebar.module';


@NgModule({
  declarations: [
    AppComponent,
    ComingSoonComponent,

    WebviewDirective,
    MainWindowComponent,
    QueryErrorComponent,
    HighlightjsWrapperComponent,
    CreateComponent,
    TopBarComponent,
    ConnectionWindowComponent,
    QueryOutputComponent,
  ],
  imports: [
    /* Misc */
    AppRoutingModule,
    ConnectionWindowModule,
    DashboardModule,
    SidebarModule,

    /* Editors */
    CreatureModule,
  ],
  providers: [
    ElectronService,
    MysqlService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
