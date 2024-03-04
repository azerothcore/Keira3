import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MultiRowEditorComponent } from '@keira/shared/core';
import { GossipMenuOption, OPTION_ICON, OPTION_TYPE } from '@keira/shared/acore-world-model';
import { GossipHandlerService } from '../gossip-handler.service';
import { GossipMenuOptionService } from './gossip-menu-option.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-gossip-menu-option',
  templateUrl: './gossip-menu-option.component.html',
  styleUrls: ['./gossip-menu-option.component.scss'],
})
export class GossipMenuOptionComponent extends MultiRowEditorComponent<GossipMenuOption> {
  readonly OPTION_ICON = OPTION_ICON;
  readonly OPTION_TYPE = OPTION_TYPE;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: GossipMenuOptionService,
    public handlerService: GossipHandlerService,
  ) {
    super(editorService, handlerService);
  }

  showGossipPreview = true;
}
