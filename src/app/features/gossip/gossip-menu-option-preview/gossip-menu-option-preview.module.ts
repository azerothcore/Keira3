import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';

import { QueryOutputModule } from '@keira-shared/modules/query-output/query-output.module';
import { GossipMenuOptionPreviewComponent } from './gossip-menu-option-preview.component';

@NgModule({
  declarations: [
    GossipMenuOptionPreviewComponent,
  ],
  imports: [
    BrowserModule,
    QueryOutputModule,
    PerfectScrollbarModule,
  ],
  exports: [
    GossipMenuOptionPreviewComponent,
  ],
})
export class GossipMenuOptionPreviewModule {}
