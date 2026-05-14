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
import { CopyMode, RelatedTable, RelatedTableState } from './copy-output.model';
import { CopyOutputService } from './copy-output.service';

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
  protected readonly copyOutputService = inject(CopyOutputService);

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

    this.subscriptions.push(
      this.copyOutputService.computeRelatedTableStates(inputTables, this.sourceId(), this.tableName()).subscribe((states) => {
        this.relatedTableStates.set(states);
        this.generateCopyQuery();
      }),
    );
  }

  protected generateCopyQuery(): void {
    this.subscriptions.push(
      this.copyOutputService
        .generateCopyQueryForStates(this.relatedTableStates(), this.sourceId(), this.newId(), this.tableName(), this.idField())
        .subscribe((query) => {
          this.copyQuery.set(query);
        }),
    );
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
