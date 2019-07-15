import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { PERFECT_SCROLLBAR_CONFIG, PerfectScrollbarConfigInterface, PerfectScrollbarModule } from 'ngx-perfect-scrollbar';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

import { SidebarComponent } from './sidebar.component';

@NgModule({
  declarations: [
    SidebarComponent,
  ],
  imports: [
    RouterModule,
    BrowserAnimationsModule,
    PerfectScrollbarModule,
  ],
  exports: [
    SidebarComponent,
  ],
  providers: [
    { provide: PERFECT_SCROLLBAR_CONFIG, useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG },
  ]
})
export class SidebarModule {}
