import { PoolProblem } from '@keira/shared/utils';
import { ChangeDetectionStrategy, Component, computed, effect, inject, untracked } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PoolPool } from '@keira/shared/acore-world-model';
import { EditorButtonsComponent, QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { TableRow } from '@keira/shared/constants';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { TooltipDirective } from 'ngx-bootstrap/tooltip';
import { Lookup } from '../lookup';
import { PoolMembersComponent } from '../pool-members.component';
import { PoolPoolService } from './pool-pool.service';

/**
 * Pool Editor > pools: the pools in this one (`pool_pool`), each spawned like a member (with its chance), what the
 * world server would refuse (a pool in itself or in its own child, child pools without `pool_template`, pools already
 * in another mother pool), and a way to open each.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-pool-pool',
  templateUrl: './pool-pool.component.html',
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
export class PoolPoolComponent extends PoolMembersComponent<PoolPool> {
  protected override readonly editorService = inject(PoolPoolService);
  private readonly query = (sql: string) => this.editorService.queryService.query<TableRow>(sql);
  /** The child pools' `pool_template`. */
  private readonly templates = new Lookup(
    this.query,
    (ids) => `SELECT entry AS id, max_limit, IFNULL(description, '') AS description FROM pool_template WHERE entry IN (${ids})`,
  );
  /** The other mother pools holding some of them. */
  private readonly otherMothers = new Lookup(
    this.query,
    (ids) => `SELECT pool_id AS id, mother_pool FROM pool_pool WHERE pool_id IN (${ids}) AND mother_pool <> ${this.poolId()}`,
  );

  constructor() {
    super();
    effect(() => {
      const ids = this.editorService.rows().map((row) => Number(row.pool_id));
      untracked(() => this.keep(this.templates.need(ids), this.otherMothers.need(ids)));
    });
  }

  protected readonly problems = computed<PoolProblem[]>(() => {
    const rows = this.editorService.rows();
    const problems = this.chanceChecks(rows.map((row) => Number(row.chance)));
    const id = this.poolId();
    const mother = this.mother();
    if (rows.some((row) => row.pool_id === id || row.pool_id === mother)) {
      problems.push({ key: 'POOL_LOOP' });
    }
    const missing = rows.filter((row) => this.templates.get(row.pool_id) === null).map((row) => row.pool_id);
    if (missing.length) {
      problems.push({ key: 'CHILD_NO_TEMPLATE', params: { ids: missing.join(', ') } });
    }
    const elsewhere = rows.filter((row) => this.otherMothers.get(row.pool_id));
    if (elsewhere.length) {
      const list = elsewhere.map((row) => `${row.pool_id} (${this.otherMothers.get(row.pool_id)?.['mother_pool']})`).join(', ');
      problems.push({ key: 'OTHER_MOTHER', params: { list } });
    }
    return problems;
  });

  /** A child pool's description. */
  protected childName(id: number): string {
    return String(this.templates.get(id)?.['description'] ?? '');
  }

  private poolId(): number {
    return Math.trunc(Number(this.handlerService.selected));
  }
}
