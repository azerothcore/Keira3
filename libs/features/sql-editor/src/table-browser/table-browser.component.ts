import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DTCFG } from '@keira/shared/config';
import { TableRow } from '@keira/shared/constants';
import { QueryErrorComponent } from '@keira/shared/base-editor-components';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { TranslatePipe } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { QueryError } from 'mysql2';
import { firstValueFrom } from 'rxjs';
import { TABLE_OPERATORS, TableCondition, tableQuery } from './table-query';

/**
 * Any table of the world database, searched by conditions on its columns and shown as a table (#1305, #1306): for
 * the tables Keira has no editor for. Read only; the query can be taken to the SQL editor.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-table-browser',
  templateUrl: './table-browser.component.html',
  imports: [FormsModule, NgxDatatableModule, TranslatePipe, QueryErrorComponent],
})
export class TableBrowserComponent implements OnInit {
  private readonly queryService = inject(MysqlQueryService);

  protected readonly DTCFG = DTCFG;
  protected readonly OPERATORS = TABLE_OPERATORS;
  protected readonly tables = signal<string[]>([]);
  protected readonly table = signal('');
  protected readonly columns = signal<string[]>([]);
  protected readonly conditions = signal<TableCondition[]>([]);
  protected readonly limit = signal(100);
  protected readonly rows = signal<TableRow[] | undefined>(undefined);
  protected readonly error = signal<QueryError | undefined>(undefined);

  async ngOnInit(): Promise<void> {
    const rows = (await this.read(this.queryService.getTables())) ?? [];
    this.tables.set(rows.map((row) => String(Object.values(row)[0])).sort());
  }

  protected async pickTable(table: string): Promise<void> {
    this.table.set(table);
    this.rows.set(undefined);
    this.conditions.set([]);
    const columns = (await this.read(this.queryService.getColumns(table))) ?? [];
    this.columns.set(columns.map((column) => String(column['Field'])));
  }

  protected addCondition(): void {
    this.conditions.set([...this.conditions(), { join: 'AND', field: this.columns()[0] ?? '', operator: '=', value: '' }]);
  }

  protected changeCondition(index: number, change: Partial<TableCondition>): void {
    this.conditions.set(this.conditions().map((condition, i) => (i === index ? { ...condition, ...change } : condition)));
  }

  protected removeCondition(index: number): void {
    this.conditions.set(this.conditions().filter((_, i) => i !== index));
  }

  protected query(): string {
    return tableQuery(this.table(), this.columns(), this.conditions(), this.limit());
  }

  protected async search(): Promise<void> {
    this.rows.set((await this.read(this.queryService.query<TableRow>(this.query()))) ?? []);
  }

  private async read<T>(answer: Parameters<typeof firstValueFrom<T>>[0]): Promise<T | undefined> {
    this.error.set(undefined);
    try {
      return await firstValueFrom(answer);
    } catch (error) {
      this.error.set(error as QueryError);
      return undefined;
    }
  }
}
