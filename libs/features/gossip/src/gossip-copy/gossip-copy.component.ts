import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CopyOutputComponent } from '@keira/shared/base-editor-components';
import { GossipHandlerService } from '../gossip-handler.service';
import { Router } from '@angular/router';
import { GOSSIP_MENU_TABLE, GOSSIP_MENU_ID, GOSSIP_MENU_OPTION_TABLE, GOSSIP_MENU_OPTION_ID } from '@keira/shared/acore-world-model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-gossip-copy',
  templateUrl: './gossip-copy.component.html',
  standalone: true,
  imports: [CopyOutputComponent],
})
export class GossipCopyComponent implements OnInit {
  private readonly router = inject(Router);
  protected readonly handlerService = inject(GossipHandlerService);

  protected readonly tableName = GOSSIP_MENU_TABLE;
  protected readonly idField = GOSSIP_MENU_ID;
  protected sourceId!: string | number;
  protected newId!: string | number;

  protected readonly relatedTables = [{ tableName: GOSSIP_MENU_OPTION_TABLE, idField: GOSSIP_MENU_OPTION_ID }];

  ngOnInit(): void {
    if (!this.handlerService.sourceId || !this.handlerService.selected) {
      this.router.navigate(['/gossip/select']);
      return;
    }

    this.sourceId = this.handlerService.sourceId;
    this.newId = this.handlerService.selected;
  }
}
