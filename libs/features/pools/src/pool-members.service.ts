import { inject, signal } from '@angular/core';
import { TableRow } from '@keira/shared/constants';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { PoolHandlerService } from './pool-handler.service';

/** The members of a pool in one of its tables, with their rows as a signal (for the checks). */
export abstract class PoolMembersService<T extends TableRow> extends MultiRowEditorService<T> {
  protected override readonly handlerService = inject(PoolHandlerService);
  private readonly _rows = signal<T[]>([]);
  /** The rows as edited. */
  readonly rows = this._rows.asReadonly();

  protected override updateFullQuery(): void {
    super.updateFullQuery();
    this._rows.set(this._newRows);
  }
}
