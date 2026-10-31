import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PoolTemplate } from '@keira/shared/acore-world-model';
import { SingleRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { TableRow } from '@keira/shared/constants';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { TooltipDirective } from 'ngx-bootstrap/tooltip';
import { openPool, PoolPlace, showInWorldEditor } from '../pool-links';
import { PoolProblem } from '../pool-checks';
import { PoolHandlerService } from '../pool-handler.service';
import { PoolTemplateService } from './pool-template.service';

/** What a pool holds, from its other tables. */
export interface PoolSummary {
  creatures: number;
  gameobjects: number;
  pools: number;
  quests: number;
  /** The pool it's in (`pool_pool.mother_pool`), if any. */
  mother: number | null;
  /** The game event it spawns (or is removed) during, if any. */
  event: number | null;
}

/**
 * Pool Editor: a pool (`pool_template`: how many of its members are up at once), what it holds (creatures,
 * gameobjects, other pools, quests: each in its own editor), the pool it's in and its game event, what's wrong with it,
 * and a way to see it in the World Editor.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-pool-template',
  templateUrl: './pool-template.component.html',
  imports: [
    TopBarComponent,
    TranslateDirective,
    TranslatePipe,
    QueryOutputComponent,
    FormsModule,
    ReactiveFormsModule,
    TooltipDirective,
    RouterLink,
  ],
})
export class PoolTemplateComponent extends SingleRowEditorComponent<PoolTemplate> implements OnInit {
  protected override readonly editorService = inject(PoolTemplateService);
  readonly handlerService = inject(PoolHandlerService);
  private readonly router = inject(Router);
  protected readonly summary = signal<PoolSummary | undefined>(undefined);
  /** A spawn of the pool, to show it in the World Editor. */
  protected readonly place = signal<PoolPlace | undefined>(undefined);

  protected readonly problems = computed<PoolProblem[]>(() => {
    const summary = this.summary();
    if (!summary) {
      return [];
    }
    const problems: PoolProblem[] = [];
    const kinds = [summary.creatures, summary.gameobjects, summary.pools].filter(Boolean).length;
    if (!kinds && !summary.quests && !this.handlerService.isNew) {
      problems.push({ key: 'EMPTY' });
    }
    if (kinds > 1) {
      problems.push({ key: 'MIXED' });
    }
    if (summary.quests && summary.mother) {
      problems.push({ key: 'QUEST_IN_MOTHER', params: { mother: summary.mother } });
    }
    return problems;
  });

  override ngOnInit(): void {
    super.ngOnInit();
    const id = Math.trunc(Number(this.handlerService.selected));
    const count = (table: string, field: string) => `(SELECT COUNT(*) FROM ${table} WHERE ${field} = ${id})`;
    const query = this.editorService.queryService;
    this.subscriptions.push(
      query
        .query<TableRow>(
          `SELECT ${count('pool_creature', 'pool_entry')} AS creatures, ${count('pool_gameobject', 'pool_entry')} AS gameobjects, ` +
            `${count('pool_pool', 'mother_pool')} AS pools, ${count('pool_quest', 'pool_entry')} AS quests, ` +
            `(SELECT mother_pool FROM pool_pool WHERE pool_id = ${id} LIMIT 1) AS mother, ` +
            `(SELECT eventEntry FROM game_event_pool WHERE pool_entry = ${id} LIMIT 1) AS event`,
        )
        .subscribe({
          next: (rows) => {
            const row = rows?.[0];
            const optional = (value: unknown) => (value === null || value === undefined ? null : Number(value));
            this.summary.set(
              row && {
                creatures: Number(row['creatures']),
                gameobjects: Number(row['gameobjects']),
                pools: Number(row['pools']),
                quests: Number(row['quests']),
                mother: optional(row['mother']),
                event: optional(row['event']),
              },
            );
          },
          error: () => this.summary.set(undefined),
        }),
    );
    const spawn = (type: string) =>
      `SELECT '${type}' AS type, s.guid, s.map, s.position_x AS x, s.position_y AS y, s.position_z AS z ` +
      `FROM pool_${type} p JOIN ${type} s ON s.guid = p.guid WHERE p.pool_entry = ${id}`;
    this.subscriptions.push(
      query.query<TableRow>(`(${spawn('creature')} LIMIT 1) UNION ALL (${spawn('gameobject')} LIMIT 1)`).subscribe({
        next: (rows) => {
          const row = rows?.[0];
          this.place.set(
            row && {
              type: row['type'] as PoolPlace['type'],
              guid: Number(row['guid']),
              map: Number(row['map']),
              x: Number(row['x']),
              y: Number(row['y']),
              z: Number(row['z']),
            },
          );
        },
        error: () => this.place.set(undefined),
      }),
    );
  }

  protected showIn3d(place: PoolPlace): void {
    showInWorldEditor(this.router, place);
  }

  /** Opens the pool this one is in. */
  protected openPool(id: number): void {
    openPool(this.router, this.handlerService, id);
  }
}
