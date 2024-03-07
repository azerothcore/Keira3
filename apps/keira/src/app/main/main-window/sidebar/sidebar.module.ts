import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { LogoutBtnComponent } from './logout-btn/logout-btn.component';
import { SidebarComponent } from './sidebar.component';
import { UnsavedIconComponent } from './unsaved-icon/unsaved-icon.component';
import { SwitchLanguageModule } from '@keira/shared/core';

@NgModule({
  imports: [
    RouterModule,
    BrowserAnimationsModule,
    ModalModule,
    TooltipModule,
    TranslateModule,
    SwitchLanguageModule,
    SidebarComponent,
    LogoutBtnComponent,
    UnsavedIconComponent,
  ],
  exports: [SidebarComponent],
})
export class SidebarModule {}
