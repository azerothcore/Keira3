import { ChangeDetectionStrategy, Component, computed, effect, inject, untracked } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GameEventPool } from '@keira/shared/acore-world-model';
import { EditorButtonsComponent, QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { TableRow } from '@keira/shared/constants';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { TooltipDirective } from 'ngx-bootstrap/tooltip';
import { Lookup } from '../lookup';
import { PoolProblem } from '../pool-checks';
import { PoolMembersComponent } from '../pool-members.component';
import { GameEventPoolService } from './game-event-pool.service';

/** Pool Editor > event: the game event the pool spawns during (`game_event_pool`; negative: it's removed during it). */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-game-event-pool',
  templateUrl: './game-event-pool.component.html',
  imports: [
    TopBarComponent,
    TranslateDirective,
    TranslatePipe,
    QueryOutputComponent,
    FormsModule,
    ReactiveFormsModule,
    TooltipDirective,
    EditorButtonsComponent,
    NgxDatatableModule,
  ],
})
export class GameEventPoolComponent extends PoolMembersComponent<GameEventPool> {
  protected override readonly editorService = inject(GameEventPoolService);
  private readonly events = new Lookup(
    (sql) => this.editorService.queryService.query<TableRow>(sql),
    (ids) => `SELECT eventEntry AS id, IFNULL(description, '') AS description FROM game_event WHERE eventEntry IN (${ids})`,
  );

  constructor() {
    super();
    effect(() => {
      const ids = this.editorService.rows().map((row) => Math.abs(Number(row.eventEntry)));
      untracked(() => this.keep(this.events.need(ids)));
    });
  }

  protected readonly problems = computed<PoolProblem[]>(() => {
    const rows = this.editorService.rows();
    const problems = this.chanceChecks(undefined);
    if (rows.length > 1) {
      problems.push({ key: 'ONE_EVENT' });
    }
    const missing = rows.filter((row) => this.events.get(Math.abs(row.eventEntry)) === null).map((row) => row.eventEntry);
    if (missing.length) {
      problems.push({ key: 'MISSING_EVENT', params: { ids: missing.join(', ') } });
    }
    return problems;
  });

  /** An event's description (with "removed during" for negative entries). */
  protected eventName(entry: number): string {
    return String(this.events.get(Math.abs(entry))?.['description'] ?? '');
  }
}
