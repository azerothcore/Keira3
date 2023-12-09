import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MultiRowEditorComponent } from '@keira-abstract/components/editors/multi-row-editor.component';
import { OPTION_ICON } from '@keira-constants/options/gossip-option-icon';
import { OPTION_TYPE } from '@keira-constants/options/gossip-option-type';
import { GossipMenuOption } from '@keira-types/gossip-menu-option.type';
import { GossipHandlerService } from '../gossip-handler.service';
import { GossipMenuOptionService } from './gossip-menu-option.service';

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'keira-gossip-menu-option',
  templateUrl: './gossip-menu-option.component.html',
  styleUrls: ['./gossip-menu-option.component.scss'],
})
export class GossipMenuOptionComponent extends MultiRowEditorComponent<GossipMenuOption> {
  readonly OPTION_ICON = OPTION_ICON;
  readonly OPTION_TYPE = OPTION_TYPE;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(public editorService: GossipMenuOptionService, public handlerService: GossipHandlerService) {
    super(editorService, handlerService);
  }

  showGossipPreview = true;
}
