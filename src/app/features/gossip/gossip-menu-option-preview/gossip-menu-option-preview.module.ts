import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { QueryOutputModule } from '@keira-shared/modules/query-output/query-output.module';
import { TranslateModule } from '@ngx-translate/core';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { GossipMenuOptionPreviewComponent } from './gossip-menu-option-preview.component';

@NgModule({
  declarations: [GossipMenuOptionPreviewComponent],
  imports: [BrowserModule, QueryOutputModule, PerfectScrollbarModule, TranslateModule],
  exports: [GossipMenuOptionPreviewComponent],
})
export class GossipMenuOptionPreviewModule {}
