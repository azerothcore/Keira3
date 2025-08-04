import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { SAI_TYPES } from '@keira/shared/acore-world-model';

import { MysqlQueryService } from '@keira/shared/db-layer';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-sai-top-bar',
  templateUrl: './sai-top-bar.component.html',
  imports: [],
})
export class SaiTopBarComponent {
  readonly queryService = inject(MysqlQueryService);

  readonly selected = input.required<string>();
  readonly selectedName = input.required<string | null>();
  readonly isNew = input.required<boolean>();

  readonly selectedText = computed<string>(() => {
    const selected: { entryorguid: number; source_type: number } = JSON.parse(this.selected());

    switch (selected.source_type) {
      case SAI_TYPES.SAI_TYPE_CREATURE:
        return `Creature ${this.getGuidOrIdText(selected.entryorguid)} (${this.selectedName()})`;
      case SAI_TYPES.SAI_TYPE_GAMEOBJECT:
        return `Gameobject ${this.getGuidOrIdText(selected.entryorguid)} (${this.selectedName()})`;
      case SAI_TYPES.SAI_TYPE_AREATRIGGER:
        return `Areatrigger ID ${selected.entryorguid}`;
      case SAI_TYPES.SAI_TYPE_TIMED_ACTIONLIST:
        return `Timed Actionlist ID ${selected.entryorguid} (${this.selectedName()})`;
      default:
        return `Unknown SAI Type ${selected.source_type} for ${this.getGuidOrIdText(selected.entryorguid)}`;
    }
  });

  private getGuidOrIdText(entryorguid: number): string {
    if (entryorguid < 0) {
      return `GUID ${-entryorguid}`;
    } else {
      return `ID ${entryorguid}`;
    }
  }
}
