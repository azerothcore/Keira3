import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ModalModule } from 'ngx-bootstrap';
import { PERFECT_SCROLLBAR_CONFIG, PerfectScrollbarConfigInterface, PerfectScrollbarModule } from 'ngx-perfect-scrollbar';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

import { SidebarComponent } from './sidebar.component';
import { LogoutBtnComponent } from './logout-btn/logout-btn.component';
import { ModalConfirmComponent } from '../../../shared/modules/modal-confirm/modal-confirm.component';
import { ModalConfirmModule } from '../../../shared/modules/modal-confirm/modal-confirm.module';

@NgModule({
  entryComponents: [
    ModalConfirmComponent
  ],
  declarations: [
    SidebarComponent,
    LogoutBtnComponent,
  ],
  imports: [
    RouterModule,
    BrowserAnimationsModule,
    PerfectScrollbarModule,
    ModalModule.forRoot(),
    ModalConfirmModule
  ],
  exports: [
    SidebarComponent,
  ],
  providers: [
    { provide: PERFECT_SCROLLBAR_CONFIG, useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG },
  ]
})
export class SidebarModule {}
