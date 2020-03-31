import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ModalModule, TooltipModule } from 'ngx-bootstrap';
import { PERFECT_SCROLLBAR_CONFIG, PerfectScrollbarConfigInterface, PerfectScrollbarModule } from 'ngx-perfect-scrollbar';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

import { SidebarComponent } from './sidebar.component';
import { LogoutBtnComponent } from './logout-btn/logout-btn.component';
import { ModalConfirmComponent } from '@keira-shared/modules/modal-confirm/modal-confirm.component';
import { ModalConfirmModule } from '@keira-shared/modules/modal-confirm/modal-confirm.module';
import { UnsavedIconComponent } from './unsaved-icon/unsaved-icon.component';

@NgModule({
  entryComponents: [
    ModalConfirmComponent
  ],
  declarations: [
    SidebarComponent,
    LogoutBtnComponent,
    UnsavedIconComponent,
  ],
  imports: [
    RouterModule,
    BrowserAnimationsModule,
    PerfectScrollbarModule,
    ModalModule.forRoot(),
    ModalConfirmModule,
    TooltipModule
  ],
  exports: [
    SidebarComponent,
  ],
  providers: [
    { provide: PERFECT_SCROLLBAR_CONFIG, useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG },
  ]
})
export class SidebarModule {}
