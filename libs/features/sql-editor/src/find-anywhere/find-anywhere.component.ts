import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DTCFG } from '@keira/shared/config';
import { TableRow } from '@keira/shared/constants';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { TranslatePipe } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { QueryError } from 'mysql2';
import { firstValueFrom } from 'rxjs';
import { FIND_KINDS, FIND_REFERENCES, FindKind, findQuery } from './find-anywhere';

export interface FindResult {
  table: string;
  query: string;
  rows: TableRow[];
  columns: string[];
  error?: string;
}

export const FIND_LIMIT = 50;

/**
 * Every table using a creature, gameobject, item, quest, spell or broadcast text id (Find Anywhere): spawns, quest
 * relations, loot, vendors, SmartAI, conditions, the DB scripts and more, in one search.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-find-anywhere',
  templateUrl: './find-anywhere.component.html',
  imports: [FormsModule, NgxDatatableModule, TranslatePipe],
})
export class FindAnywhereComponent {
  private readonly queryService = inject(MysqlQueryService);

  protected readonly DTCFG = DTCFG;
  protected readonly KINDS = FIND_KINDS;
  protected readonly LIMIT = FIND_LIMIT;
  protected readonly kind = signal<FindKind>('creature');
  protected readonly id = signal<number | null>(null);
  protected readonly searching = signal(false);
  protected readonly results = signal<FindResult[] | undefined>(undefined);

  protected async find(): Promise<void> {
    const id = this.id();
    if (id === null || !Number.isFinite(id)) {
      return;
    }
    this.searching.set(true);
    const results = await Promise.all(
      FIND_REFERENCES[this.kind()].map(async (reference): Promise<FindResult> => {
        const query = findQuery(reference, id, FIND_LIMIT);
        try {
          const rows = (await firstValueFrom(this.queryService.query<TableRow>(query))) ?? [];
          return { table: reference.table, query, rows, columns: rows.length ? Object.keys(rows[0]) : [] };
        } catch (error) {
          return { table: reference.table, query, rows: [], columns: [], error: (error as QueryError).message ?? String(error) };
        }
      }),
    );
    this.results.set(results.filter((result) => result.rows.length || result.error));
    this.searching.set(false);
  }
}
