import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CopyOutputComponent } from '@keira/shared/base-editor-components';
import { GossipHandlerService } from '../gossip-handler.service';
import { GOSSIP_MENU_TABLE, GOSSIP_MENU_ID, GOSSIP_MENU_OPTION_TABLE, GOSSIP_MENU_OPTION_ID } from '@keira/shared/acore-world-model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-gossip-copy',
  template: `<keira-copy-output
    [handlerService]="handlerService"
    selectRoute="gossip/select"
    [tableName]="tableName"
    [idField]="idField"
    [relatedTables]="relatedTables"
  />`,
  imports: [CopyOutputComponent],
})
export class GossipCopyComponent {
  protected readonly handlerService = inject(GossipHandlerService);

  protected readonly tableName = GOSSIP_MENU_TABLE;
  protected readonly idField = GOSSIP_MENU_ID;

  protected readonly relatedTables = [{ tableName: GOSSIP_MENU_OPTION_TABLE, idField: GOSSIP_MENU_OPTION_ID }];
}
