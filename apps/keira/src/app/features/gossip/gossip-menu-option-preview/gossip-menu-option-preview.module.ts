import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { QueryOutputModule } from '@keira/shared/core';
import { TranslateModule } from '@ngx-translate/core';
import { GossipMenuOptionPreviewComponent } from './gossip-menu-option-preview.component';

@NgModule({
  declarations: [GossipMenuOptionPreviewComponent],
  imports: [BrowserModule, QueryOutputModule, TranslateModule],
  exports: [GossipMenuOptionPreviewComponent],
})
export class GossipMenuOptionPreviewModule {}
