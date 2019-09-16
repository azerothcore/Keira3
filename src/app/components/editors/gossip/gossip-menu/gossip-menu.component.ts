import { Component } from '@angular/core';

import { MultiRowEditorComponent } from '../../shared/multi-row-editor.component';
import { GossipMenu } from '../../../../types/gossip-menu.type';
import { GossipMenuService } from '../../../../services/editors/gossip/gossip-menu.service';
import { GossipHandlerService } from '../../../../services/handlers/gossip-handler.service';

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
