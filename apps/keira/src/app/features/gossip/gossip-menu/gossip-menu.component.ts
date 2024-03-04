import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MultiRowEditorComponent, MysqlQueryService } from '@keira/shared/core';
import { GossipMenu } from '@keira/shared/acore-world-model';
import { GossipHandlerService } from '../gossip-handler.service';
import { GossipMenuService } from './gossip-menu.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-gossip-menu',
  templateUrl: './gossip-menu.component.html',
  styleUrls: ['./gossip-menu.component.scss'],
})
export class GossipMenuComponent extends MultiRowEditorComponent<GossipMenu> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: GossipMenuService,
    public handlerService: GossipHandlerService,
    readonly queryService: MysqlQueryService,
  ) {
    super(editorService, handlerService);
  }
}
