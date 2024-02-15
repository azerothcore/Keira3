import { NgModule } from '@angular/core';
import { GossipHandlerService } from './gossip-handler.service';
import { GossipMenuOptionModule } from './gossip-menu-option/gossip-menu-option.module';
import { GossipMenuModule } from './gossip-menu/gossip-menu.module';
import { SelectGossipModule } from './select-gossip/select-gossip.module';

const modules = [SelectGossipModule, GossipMenuModule, GossipMenuOptionModule];

@NgModule({
  imports: [modules],
  exports: [modules],
  providers: [GossipHandlerService],
})
export class GossipModule {}
