import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CopyOutputComponent } from '@keira/shared/base-editor-components';
import { FishingLootHandlerService } from './fishing-loot-handler.service';
import { Router } from '@angular/router';
import { FISHING_LOOT_TEMPLATE_TABLE, LOOT_TEMPLATE_ID } from '@keira/shared/acore-world-model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-fishing-loot-copy',
  templateUrl: './fishing-loot-copy.component.html',
  imports: [CopyOutputComponent],
})
export class FishingLootCopyComponent implements OnInit {
  private readonly router = inject(Router);
  protected readonly handlerService = inject(FishingLootHandlerService);

  protected readonly tableName = FISHING_LOOT_TEMPLATE_TABLE;
  protected readonly idField = LOOT_TEMPLATE_ID;
  protected sourceId!: string | number;
  protected newId!: string | number;

  protected readonly relatedTables: Array<{ tableName: string; idField: string }> = [];

  ngOnInit(): void {
    if (!this.handlerService.sourceId || !this.handlerService.selected) {
      this.router.navigate(['/other-loots/select-fishing']);
      return;
    }

    this.sourceId = this.handlerService.sourceId;
    this.newId = this.handlerService.selected;
  }
}
