import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { QueryOutputModule } from '@keira-shared/modules/query-output/query-output.module';
import { TranslateModule } from '@ngx-translate/core';
import { GossipMenuOptionPreviewComponent } from './gossip-menu-option-preview.component';

@NgModule({
  declarations: [GossipMenuOptionPreviewComponent],
  imports: [BrowserModule, QueryOutputModule, TranslateModule],
  exports: [GossipMenuOptionPreviewComponent],
})
export class GossipMenuOptionPreviewModule {}
