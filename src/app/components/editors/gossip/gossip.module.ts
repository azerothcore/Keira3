import { NgModule } from '@angular/core';
import { SelectGossipModule } from './select-gossip/select-gossip.module';
import { GossipMenuModule } from './gossip-menu/gossip-menu.module';

const modules = [
  SelectGossipModule,
  GossipMenuModule,
];

@NgModule({
  imports: [modules],
  exports: [modules],
})
export class GossipModule {}
