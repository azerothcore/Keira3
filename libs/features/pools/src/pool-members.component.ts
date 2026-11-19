import { chanceProblems, PoolProblem } from '@keira/shared/utils';
import { Directive, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MultiRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { TableRow } from '@keira/shared/constants';
import { Subscription } from 'rxjs';
import { openPool } from './pool-links';
import { PoolHandlerService } from './pool-handler.service';
import { PoolMembersService } from './pool-members.service';

/** An editor of a pool's members: knows the pool's `max_limit` (null: the pool isn't in `pool_template`). */
@Directive()
export abstract class PoolMembersComponent<T extends TableRow> extends MultiRowEditorComponent<T> implements OnInit {
  protected abstract override readonly editorService: PoolMembersService<T>;
  readonly handlerService = inject(PoolHandlerService);
  protected readonly router = inject(Router);
  /** The pool's `max_limit` (undefined while loading; null: no `pool_template` row). */
  protected readonly maxLimit = signal<number | null | undefined>(undefined);
  /** The pool the pool is in (`pool_pool.mother_pool`), if any. */
  protected readonly mother = signal<number | null>(null);

  override ngOnInit(): void {
    super.ngOnInit();
    const id = Math.trunc(Number(this.handlerService.selected));
    this.subscriptions.push(
      this.editorService.queryService.query<TableRow>(`SELECT max_limit FROM pool_template WHERE entry = ${id}`).subscribe({
        next: (rows) => this.maxLimit.set(rows?.length ? Number(rows[0]['max_limit']) : null),
        error: () => this.maxLimit.set(undefined),
      }),
      this.editorService.queryService.query<TableRow>(`SELECT mother_pool FROM pool_pool WHERE pool_id = ${id}`).subscribe({
        next: (rows) => this.mother.set(rows?.length ? Number(rows[0]['mother_pool']) : null),
        error: () => this.mother.set(null),
      }),
    );
  }

  /** The problems of the members' chances (and of a pool without its `pool_template` row). */
  protected chanceChecks(chances: number[] | undefined): PoolProblem[] {
    const maxLimit = this.maxLimit();
    if (maxLimit === null) {
      return [{ key: 'NO_TEMPLATE' }];
    }
    return maxLimit === undefined || !chances ? [] : chanceProblems(chances, maxLimit);
  }

  /** Keeps the subscriptions of lookups (to end them with the editor). */
  protected keep(...subscriptions: (Subscription | undefined)[]): void {
    this.subscriptions.push(...subscriptions.filter((subscription): subscription is Subscription => !!subscription));
  }

  /** Opens a pool in the Pool Editor. */
  protected openPool(id: number): void {
    openPool(this.router, this.handlerService, id);
  }
}
