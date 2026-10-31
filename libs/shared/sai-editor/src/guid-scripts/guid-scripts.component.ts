import { ChangeDetectionStrategy, Component, effect, inject, input, signal, untracked } from '@angular/core';
import { SAI_TYPES } from '@keira/shared/acore-world-model';
import { TableRow } from '@keira/shared/constants';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { TranslatePipe } from '@ngx-translate/core';
import { SaiHandlerService } from '../sai-handler.service';

/** A spawn of the entry with a SmartAI script of its own (`smart_scripts.entryorguid` = −guid). */
export interface GuidScript {
  guid: number;
  map: number;
  rows: number;
}

/**
 * The spawns of a creature or gameobject entry that have a SmartAI script of their own (GUID-specific: entryorguid is
 * minus the spawn's guid), each opened in the SmartAI editor with a click.
 */
@Component({
  selector: 'keira-guid-scripts',
  templateUrl: './guid-scripts.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
})
export class GuidScriptsComponent {
  readonly sourceType = input.required<number>();
  readonly entry = input.required<number>();
  private readonly queryService = inject(MysqlQueryService);
  private readonly handlerService = inject(SaiHandlerService);
  protected readonly scripts = signal<GuidScript[]>([]);

  constructor() {
    effect(() => {
      const [sourceType, entry] = [this.sourceType(), Math.trunc(this.entry())];
      const table = sourceType === SAI_TYPES.SAI_TYPE_GAMEOBJECT ? 'gameobject' : 'creature';
      untracked(() =>
        this.queryService
          .query<TableRow>(
            `SELECT s.entryorguid, t.map, COUNT(*) AS rows FROM smart_scripts s JOIN ${table} t ON t.guid = -s.entryorguid ` +
              `WHERE s.source_type = ${sourceType} AND s.entryorguid < 0 AND t.id = ${entry} GROUP BY s.entryorguid, t.map ORDER BY t.guid`,
          )
          .subscribe({
            next: (rows) =>
              this.scripts.set(
                (rows ?? []).map((row) => ({ guid: -Number(row['entryorguid']), map: Number(row['map']), rows: Number(row['rows']) })),
              ),
            error: () => this.scripts.set([]),
          }),
      );
    });
  }

  protected open(script: GuidScript): void {
    this.handlerService.select(false, { entryorguid: -script.guid, source_type: this.sourceType() }, `GUID ${script.guid}`);
  }
}
