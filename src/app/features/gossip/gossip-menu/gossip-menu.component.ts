import { Component } from '@angular/core';

import { MultiRowEditorComponent } from '../../../shared/abstract/components/editors/multi-row-editor.component';
import { GossipMenu } from '../../../shared/types/gossip-menu.type';
import { GossipMenuService } from '../gossip-menu.service';
import { GossipHandlerService } from '../gossip-handler.service';

@Component({
  selector: 'app-gossip-menu',
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
