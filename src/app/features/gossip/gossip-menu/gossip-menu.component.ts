import { Component } from '@angular/core';

import { MultiRowEditorComponent } from '@keira-abstract/components/editors/multi-row-editor.component';
import { GossipMenu } from '@keira-types/gossip-menu.type';
import { GossipMenuService } from './gossip-menu.service';
import { GossipHandlerService } from '../gossip-handler.service';

@Component({
  selector: 'keira-gossip-menu',
  templateUrl: './gossip-menu.component.html',
  styleUrls: ['./gossip-menu.component.scss']
})
export class GossipMenuComponent extends MultiRowEditorComponent<GossipMenu> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: GossipMenuService,
    public handlerService: GossipHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
