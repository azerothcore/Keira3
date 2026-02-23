import { ChangeDetectionStrategy, Component, inject, OnInit, signal, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { TooltipDirective } from 'ngx-bootstrap/tooltip';
import { ClipboardService } from 'ngx-clipboard';
import { HandlerService } from '@keira/shared/base-abstract-classes';
import { TableRow } from '@keira/shared/constants';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { SubscriptionHandler } from '@keira/shared/utils';
import { QueryError } from 'mysql2';
import { QueryErrorComponent } from '../query-output/query-error/query-error.component';
import { HighlightjsWrapperComponent } from '../highlightjs-wrapper/highlightjs-wrapper.component';

type CopyMode = 'RAW' | 'ALL';

interface RelatedTable {
  tableName: string;
  idField: string;
  copyMode?: CopyMode;
  columns?: string[];
}

interface RelatedTableState {
  tableName: string;
  idField: string;
  count: number;
  included: boolean;
  copyMode: CopyMode;
  columns?: string[];
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-copy-output',
  templateUrl: './copy-output.component.html',
  styleUrls: ['./copy-output.component.scss'],
  imports: [TooltipDirective, QueryErrorComponent, HighlightjsWrapperComponent, TranslatePipe],
})
export class CopyOutputComponent<T extends TableRow> extends SubscriptionHandler implements OnInit {
  protected readonly clipboardService = inject(ClipboardService);
  protected readonly queryService = inject(MysqlQueryService);

  readonly handlerService = input<HandlerService<T> | undefined>();
  readonly tableName = input.required<string>();
  readonly idField = input.required<string>();
  readonly sourceId = input.required<string | number>();
  readonly newId = input.required<string | number>();
  readonly relatedTables = input<RelatedTable[] | undefined>();
  readonly mainCopyMode = input<CopyMode | undefined>();
  readonly mainColumns = input<string[] | undefined>();

  protected mainCopyModeSignal = signal<CopyMode>('RAW');
  protected mainColumnsSignal = signal<string[] | undefined>(undefined);

  protected copyQuery = signal<string>('');
  protected relatedTableStates = signal<RelatedTableState[]>([]);
  protected error = signal<QueryError | undefined>(undefined);
  protected executing = signal<boolean>(false);
  protected executed = signal<boolean>(false);
  protected sqlExpanded = signal<boolean>(false);

  ngOnInit(): void {
    this.mainCopyModeSignal.set(this.mainCopyMode() || 'RAW');
    this.mainColumnsSignal.set(this.mainColumns());
    this.populateRelatedTables();
  }

  protected setCopyModeForTable(tableName: string, mode: CopyMode): void {
    const normalized = mode === 'RAW' ? 'RAW' : 'ALL';

    if (tableName === this.tableName()) {
      this.mainCopyModeSignal.set(normalized);

      const states = this.relatedTableStates().map((s) => ({
        tableName: s.tableName,
        idField: s.idField,
        count: s.count,
        included: s.included,
        copyMode: s.copyMode,
        columns: s.columns,
      }));
      const idx = states.findIndex((s) => s.tableName === tableName);
      if (idx !== -1) {
        states[idx].copyMode = normalized;
        this.relatedTableStates.set(states);
      }

      this.generateCopyQuery();
      return;
    }

    const states = this.relatedTableStates().map((s) => ({
      tableName: s.tableName,
      idField: s.idField,
      count: s.count,
      included: s.included,
      copyMode: s.copyMode,
      columns: s.columns,
    }));

    const idx = states.findIndex((s) => s.tableName === tableName);
    if (idx !== -1) {
      states[idx].copyMode = normalized;
      this.relatedTableStates.set(states);
      this.generateCopyQuery();
    }
  }

  protected populateRelatedTables(): void {
    const inputTables: RelatedTable[] = [];

    // Include main table first (default to RAW)
    inputTables.push({
      tableName: this.tableName(),
      idField: this.idField(),
      copyMode: this.mainCopyMode() || 'RAW',
      columns: this.mainColumns(),
    });

    if (this.relatedTables() && this.relatedTables()!.length > 0) {
      for (const t of this.relatedTables()!) {
        inputTables.push({ tableName: t.tableName, idField: t.idField, copyMode: t.copyMode || 'RAW', columns: t.columns });
      }
    }

    const states: RelatedTableState[] = [];
    let remaining = inputTables.length;

    for (const table of inputTables) {
      this.subscriptions.push(
        this.queryService.getRowsCount(table.tableName, table.idField, this.sourceId()).subscribe((count: number | null) => {
          const num = Number(count || 0);

          const isMain = table.tableName === this.tableName();

          if (isMain || num > 0) {
            states.push({
              tableName: table.tableName,
              idField: table.idField,
              count: num,
              included: isMain ? true : true,
              copyMode: table.copyMode || 'RAW',
              columns: table.columns,
            });
          }

          remaining--;
          if (remaining === 0) {
            this.relatedTableStates.set(states);
            this.generateCopyQuery();
          }
        }),
      );
    }
  }

  protected generateCopyQuery(): void {
    const setVars = this.queryService.getCopyVarsSet(this.sourceId(), this.newId());

    const selectedTables = this.relatedTableStates().filter((t) => t.included);

    // If no tables selected, just set main table
    if (selectedTables.length === 0) {
      const query = setVars + this.queryService.getCopyQuery(this.tableName(), this.sourceId(), this.newId(), this.idField(), true);
      this.copyQuery.set(query);
      return;
    }

    // If nothing is RAW, we can quickly generate everything using getCopyQuery
    const hasAnyRaw = selectedTables.some((t) => t.copyMode === 'RAW');

    if (!hasAnyRaw) {
      let query = setVars;
      for (const table of selectedTables) {
        query += '\n' + this.queryService.getCopyQuery(table.tableName, this.sourceId(), this.newId(), table.idField, true);
      }
      this.copyQuery.set(query);
      return;
    }

    // We have at least one RAW table. We'll fetch data for RAW tables and construct queries.
    const rawTables = selectedTables.filter((t) => t.copyMode === 'RAW');

    let remainingRaw = rawTables.length;
    const tableQueries: Map<string, string> = new Map();

    for (const table of rawTables) {
      this.subscriptions.push(
        this.queryService.selectAll(table.tableName, table.idField, this.sourceId()).subscribe((rows) => {
          const cols = table.columns && table.columns.length > 0 ? table.columns : rows[0] ? Object.keys(rows[0]) : [];
          const rawQuery = this.queryService.getCopyQueryRawWithValues(table.tableName, rows, this.newId(), table.idField, cols, true);
          tableQueries.set(table.tableName, rawQuery);

          remainingRaw--;
          if (remainingRaw === 0) {
            let finalQuery = setVars;
            for (const t of selectedTables) {
              if (t.copyMode === 'RAW') {
                finalQuery += '\n' + tableQueries.get(t.tableName);
              } else {
                finalQuery += '\n' + this.queryService.getCopyQuery(t.tableName, this.sourceId(), this.newId(), t.idField, true);
              }
            }
            this.copyQuery.set(finalQuery);
          }
        }),
      );
    }
  }

  protected copy(): void {
    this.clipboardService.copyFromContent(this.copyQuery());
  }

  protected toggleRelatedTable(tableName: string): void {
    const states = this.relatedTableStates().map((s) => ({
      tableName: s.tableName,
      idField: s.idField,
      count: s.count,
      included: s.included,
      copyMode: s.copyMode,
      columns: s.columns,
    }));
    const idx = states.findIndex((s) => s.tableName === tableName);
    if (idx !== -1) {
      states[idx].included = !states[idx].included;
      this.relatedTableStates.set(states);
      this.generateCopyQuery();
    }
  }

  protected toggleCopyMode(tableName: string): void {
    const states = this.relatedTableStates().map((s) => ({
      tableName: s.tableName,
      idField: s.idField,
      count: s.count,
      included: s.included,
      copyMode: s.copyMode,
      columns: s.columns,
    }));
    const idx = states.findIndex((s) => s.tableName === tableName);
    if (idx !== -1) {
      states[idx].copyMode = states[idx].copyMode === 'RAW' ? 'ALL' : 'RAW';
      this.relatedTableStates.set(states);
      this.generateCopyQuery();
    }
  }

  protected setAllIncluded(checked: boolean): void {
    const states = this.relatedTableStates().map((s) => ({
      tableName: s.tableName,
      idField: s.idField,
      count: s.count,
      included: checked,
      copyMode: s.copyMode,
      columns: s.columns,
    }));
    this.relatedTableStates.set(states);
    this.generateCopyQuery();
  }

  protected allIncluded(): boolean {
    const states = this.relatedTableStates();
    return states.length > 0 && states.every((s) => s.included);
  }

  protected setAllCopyMode(mode: 'RAW' | 'ALL'): void {
    const states = this.relatedTableStates().map((s) => ({
      tableName: s.tableName,
      idField: s.idField,
      count: s.count,
      included: s.included,
      copyMode: mode,
      columns: s.columns,
    }));
    this.relatedTableStates.set(states);

    this.mainCopyModeSignal.set(mode);

    this.generateCopyQuery();
  }

  protected allCopyModeIsRaw(): boolean {
    const states = this.relatedTableStates();
    return states.length > 0 && states.every((s) => s.copyMode === 'RAW');
  }

  protected toggleMainCopyMode(): void {
    const newMode = this.mainCopyModeSignal() === 'RAW' ? 'ALL' : 'RAW';
    this.mainCopyModeSignal.set(newMode);
    this.generateCopyQuery();
  }

  protected toggleSqlExpanded(): void {
    this.sqlExpanded.set(!this.sqlExpanded());
  }

  protected execute(): void {
    this.executing.set(true);
    this.error.set(undefined);

    this.subscriptions.push(
      this.queryService.query(this.copyQuery()).subscribe({
        next: () => {
          this.executing.set(false);
          this.executed.set(true);
        },
        error: (error: QueryError) => {
          this.executing.set(false);
          this.error.set(error);
        },
      }),
    );
  }

  protected continue(): void {
    // Navigate to the editor for the newly created entry
    this.handlerService()!.select(false, this.newId());
  }
}
