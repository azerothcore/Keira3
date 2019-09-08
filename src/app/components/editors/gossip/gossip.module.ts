import { NgModule } from '@angular/core';
import { SelectGossipModule } from './select-gossip/select-gossip.module';

const modules = [
  SelectGossipModule,
];

@NgModule({
  imports: [modules],
  exports: [modules],
})
export class GossipModule {}
