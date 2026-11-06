import { ChangeDetectionStrategy, Component, inject, OnInit, signal, input } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Subject, switchMap } from 'rxjs';
import { TooltipDirective } from 'ngx-bootstrap/tooltip';
import { ClipboardService } from 'ngx-clipboard';
import { HandlerService } from '@keira/shared/base-abstract-classes';
import { TableRow } from '@keira/shared/constants';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { SessionSqlService } from '@keira/shared/common-services';
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

  private readonly router = inject(Router);
  private readonly sessionSql = inject(SessionSqlService);

  /** The editor's handler: the entry copied (`sourceId`) and the new one (`selected`), chosen in its Create box. */
  readonly handlerService = input.required<HandlerService<T>>();
  /** Where to go when there's nothing to copy (the page was opened without choosing an entry to copy). */
  readonly selectRoute = input.required<string>();
  readonly tableName = input.required<string>();
  readonly idField = input.required<string>();
  readonly relatedTables = input<RelatedTable[] | undefined>();
  readonly mainCopyMode = input<CopyMode | undefined>();
  readonly mainColumns = input<string[] | undefined>();

  protected copyQuery = signal<string>('');
  protected relatedTableStates = signal<RelatedTableState[]>([]);
  protected error = signal<QueryError | undefined>(undefined);
  protected executing = signal<boolean>(false);
  protected executed = signal<boolean>(false);
  protected sqlExpanded = signal<boolean>(false);
  /** The query is being made again (after a change): it can't be executed meanwhile. */
  protected readonly generating = signal<boolean>(false);
  private readonly regenerate = new Subject<void>();

  protected readonly sourceId = signal<string | number>('');
  protected readonly newId = signal<string | number>('');
  /** The entity's own SQL rather than a copy (#741): every table as raw inserts, nothing to execute. */
  protected readonly exporting = signal(false);
  protected readonly addedToSession = signal(false);

  ngOnInit(): void {
    const handler = this.handlerService();
    if (!handler.sourceId || !handler.selected) {
      void this.router.navigate([this.selectRoute()]);
      return;
    }
    this.sourceId.set(handler.sourceId);
    this.newId.set(handler.selected);
    this.exporting.set(handler.exporting);
    // (only the query of the latest states is kept)
    this.subscriptions.push(
      this.regenerate
        .pipe(switchMap(() => this.copyOutputService.generateCopyQueryForStates(this.relatedTableStates(), this.sourceId(), this.newId())))
        .subscribe((query) => {
          this.copyQuery.set(query);
          this.generating.set(false);
        }),
    );
    this.populateRelatedTables();
  }

  /** Changes the tables' states (copied or not, how) and makes the query again. */
  private updateStates(change: (state: RelatedTableState) => Partial<RelatedTableState>): void {
    this.relatedTableStates.set(this.relatedTableStates().map((state) => ({ ...state, ...change(state) })));
    this.generateCopyQuery();
  }

  protected setCopyModeForTable(tableName: string, copyMode: CopyMode): void {
    this.updateStates((state) => (state.tableName === tableName ? { copyMode } : {}));
  }

  protected populateRelatedTables(): void {
    const inputTables: RelatedTable[] = [];

    // (the main table first; raw inserts unless asked otherwise)
    inputTables.push({ tableName: this.tableName(), idField: this.idField(), copyMode: this.mainCopyMode(), columns: this.mainColumns() });
    inputTables.push(...(this.relatedTables() ?? []));

    this.subscriptions.push(
      this.copyOutputService.computeRelatedTableStates(inputTables, this.sourceId(), this.tableName()).subscribe((states) => {
        // (an export reads the rows: through a temporary table it would delete them before copying them)
        this.relatedTableStates.set(this.exporting() ? states.map((state) => ({ ...state, copyMode: 'RAW' as CopyMode })) : states);
        this.generateCopyQuery();
      }),
    );
  }

  protected generateCopyQuery(): void {
    this.generating.set(true);
    this.regenerate.next();
  }

  protected copy(): void {
    this.clipboardService.copyFromContent(this.copyQuery());
  }

  /** The query as a .sql file (#401). */
  protected save(): void {
    const url = URL.createObjectURL(new Blob([this.copyQuery()], { type: 'application/sql' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.tableName()}-${this.newId()}${this.exporting() ? '' : `-from-${this.sourceId()}`}.sql`;
    link.click();
    URL.revokeObjectURL(url);
  }

  /** The query kept in the session's SQL (#1086). */
  protected addToSession(): void {
    this.sessionSql.add(`${this.tableName()} ${this.newId()}${this.exporting() ? '' : ` (${this.sourceId()})`}`, this.copyQuery());
    this.addedToSession.set(true);
  }

  /** Back to the entity exported. */
  protected back(): void {
    const handler = this.handlerService();
    handler.select(false, this.newId(), handler.selectedName);
  }

  protected toggleRelatedTable(tableName: string): void {
    this.updateStates((state) => (state.tableName === tableName ? { included: !state.included } : {}));
  }

  protected setAllIncluded(included: boolean): void {
    // (the main table is always copied: the rest belongs to it)
    this.updateStates((state) => ({ included: included || state.tableName === this.tableName() }));
  }

  protected allIncluded(): boolean {
    const states = this.relatedTableStates();
    return states.length > 0 && states.every((s) => s.included);
  }

  protected setAllCopyMode(copyMode: CopyMode): void {
    this.updateStates(() => ({ copyMode }));
  }

  protected allCopyModeIsRaw(): boolean {
    const states = this.relatedTableStates();
    return states.length > 0 && states.every((s) => s.copyMode === 'RAW');
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
          // (the entry exists now: the editors read it rather than make a new one, even without Continue)
          this.handlerService().select(false, this.newId(), undefined, false);
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
    this.handlerService().select(false, this.newId());
  }
}
