import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CopyOutputComponent } from '@keira/shared/base-editor-components';
import { SpellHandlerService } from '../spell-handler.service';
import { Router } from '@angular/router';
import { SPELL_DBC_TABLE, SPELL_DBC_ID, SPELL_LOOT_TEMPLATE_TABLE, LOOT_TEMPLATE_ID } from '@keira/shared/acore-world-model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-spell-copy',
  templateUrl: './spell-copy.component.html',
  standalone: true,
  imports: [CopyOutputComponent],
})
export class SpellCopyComponent implements OnInit {
  private readonly router = inject(Router);
  protected readonly handlerService = inject(SpellHandlerService);

  protected readonly tableName = SPELL_DBC_TABLE;
  protected readonly idField = SPELL_DBC_ID;
  protected sourceId!: string | number;
  protected newId!: string | number;

  protected readonly relatedTables = [{ tableName: SPELL_LOOT_TEMPLATE_TABLE, idField: LOOT_TEMPLATE_ID }];

  ngOnInit(): void {
    if (!this.handlerService.sourceId || !this.handlerService.selected) {
      this.router.navigate(['/spell/select']);
      return;
    }

    this.sourceId = this.handlerService.sourceId;
    this.newId = this.handlerService.selected;
  }
}
