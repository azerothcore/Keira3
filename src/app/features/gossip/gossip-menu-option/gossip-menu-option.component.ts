import { Component } from '@angular/core';
import { MultiRowEditorComponent } from '@keira-abstract/components/editors/multi-row-editor.component';
import { OPTION_ICON } from '@keira-constants/options/gossip-option-icon';
import { OPTION_TYPE } from '@keira-constants/options/gossip-option-type';
import { GossipMenuOption } from '@keira-types/gossip-menu-option.type';
import { GossipHandlerService } from '../gossip-handler.service';
import { GossipMenuOptionService } from './gossip-menu-option.service';

@Component({
  selector: 'keira-gossip-menu-option',
  templateUrl: './gossip-menu-option.component.html',
  styleUrls: ['./gossip-menu-option.component.scss'],
})
export class GossipMenuOptionComponent extends MultiRowEditorComponent<GossipMenuOption> {
  public readonly OPTION_ICON = OPTION_ICON;
  public readonly OPTION_TYPE = OPTION_TYPE;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(public editorService: GossipMenuOptionService, public handlerService: GossipHandlerService) {
    super(editorService, handlerService);
  }

  showGossipPreview = true;
}
