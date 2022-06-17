import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ModalConfirmModule } from '@keira-shared/modules/modal-confirm/modal-confirm.module';
import { TranslateModule } from '@ngx-translate/core';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { PerfectScrollbarConfigInterface, PerfectScrollbarModule, PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { LogoutBtnComponent } from './logout-btn/logout-btn.component';
import { SidebarComponent } from './sidebar.component';
import { UnsavedIconComponent } from './unsaved-icon/unsaved-icon.component';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true,
};

@NgModule({
  declarations: [SidebarComponent, LogoutBtnComponent, UnsavedIconComponent],
  imports: [RouterModule, BrowserAnimationsModule, PerfectScrollbarModule, ModalModule, ModalConfirmModule, TooltipModule, TranslateModule],
  exports: [SidebarComponent],
  providers: [{ provide: PERFECT_SCROLLBAR_CONFIG, useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG }],
})
export class SidebarModule {}
