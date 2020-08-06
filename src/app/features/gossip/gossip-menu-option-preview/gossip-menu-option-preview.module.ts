import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { QueryOutputModule } from '@keira-shared/modules/query-output/query-output.module';
import { GossipMenuOptionPreviewComponent } from './gossip-menu-option-preview.component';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';

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
