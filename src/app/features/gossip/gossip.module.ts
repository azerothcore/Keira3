import { NgModule } from '@angular/core';
import { SelectGossipModule } from './select-gossip/select-gossip.module';
import { GossipMenuModule } from './gossip-menu/gossip-menu.module';
import { GossipMenuOptionModule } from './gossip-menu-option/gossip-menu-option.module';
import { GossipHandlerService } from './gossip-handler.service';

const modules = [
  SelectGossipModule,
  GossipMenuModule,
  GossipMenuOptionModule,
];

@NgModule({
  imports: [modules],
  exports: [modules],
  providers: [
    GossipHandlerService,
  ],
})
export class GossipModule { }
