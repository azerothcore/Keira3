import { NgModule } from '@angular/core';
import { SelectGossipModule } from './select-gossip/select-gossip.module';
import { GossipMenuModule } from './gossip-menu/gossip-menu.module';
import { GossipMenuOptionModule } from './gossip-menu-option/gossip-menu-option.module';
import { GossipHandlerService } from './gossip-handler.service';
import { GossipMenuOptionPreviewModule } from './gossip-menu-option-preview/gossip-menu-option-preview.module';

const modules = [
  SelectGossipModule,
  GossipMenuModule,
  GossipMenuOptionModule,
  GossipMenuOptionPreviewModule,
];

@NgModule({
  imports: [modules],
  exports: [modules],
  providers: [
    GossipHandlerService,
  ],
})
export class GossipModule {}
