import { ChangeDetectorRef, Service, inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { BroadcastText } from '@keira/shared/acore-world-model';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { SubscriptionHandler } from '@keira/shared/utils';
import { ADJACENT_ID_RANGE, BroadcastTextRow, getBroadcastTextRow } from './broadcast-text-browser.model';

@Service()
export class BroadcastTextBrowserService extends SubscriptionHandler {
  private readonly queryService = inject(MysqlQueryService);

  readonly searchForm = new FormGroup({
    text: new FormControl<string>('', { nonNullable: true }),
    limit: new FormControl<number>(50, { nonNullable: true }),
  });

  query = '';
  rows: BroadcastTextRow[] | undefined;
  /**
   * Bound straight to the datatable so the row the user sees highlighted and the row the copy
   * button acts on can never drift apart: this service outlives the component, the datatable does not.
   */
  selectedRows: BroadcastTextRow[] = [];
  /** Set only when a search hit a single row and the table therefore also lists its neighbours. */
  matchedId: number | undefined;

  constructor() {
    super();
    this.updateQuery();
    this.subscriptions.push(this.searchForm.valueChanges.subscribe(() => this.updateQuery()));
  }

  onSearch(changeDetectorRef: ChangeDetectorRef): void {
    this.subscriptions.push(
      this.queryService.query<BroadcastText>(this.query).subscribe((data) => {
        const rows = data.map(getBroadcastTextRow);

        // A lone hit is rarely the whole story: the ids around it are usually the rest of the dialogue.
        if (rows.length === 1) {
          this.loadAdjacentRows(rows[0], changeDetectorRef);
          return;
        }

        this.setRows(rows, undefined);
        changeDetectorRef.markForCheck();
      }),
    );
  }

  get selectedRow(): BroadcastTextRow | undefined {
    return this.selectedRows[0];
  }

  onSelect({ selected }: { selected: BroadcastTextRow[] }): void {
    this.selectedRows = [...selected];
  }

  isMatchedRow(row: BroadcastTextRow): boolean {
    return this.matchedId !== undefined && Number(row.ID) === this.matchedId;
  }

  private updateQuery(): void {
    const { text, limit } = this.searchForm.getRawValue();
    this.query = this.queryService.getBroadcastTextSearchQuery(text, limit);
  }

  private loadAdjacentRows(match: BroadcastTextRow, changeDetectorRef: ChangeDetectorRef): void {
    const matchedId = Number(match.ID);

    this.subscriptions.push(
      this.queryService
        .query<BroadcastText>(this.queryService.getBroadcastTextAdjacentQuery(matchedId, ADJACENT_ID_RANGE))
        .subscribe((data) => {
          this.setRows(data.map(getBroadcastTextRow), matchedId);
          changeDetectorRef.markForCheck();
        }),
    );
  }

  private setRows(rows: BroadcastTextRow[], matchedId: number | undefined): void {
    this.rows = rows;
    this.matchedId = matchedId;
    this.selectedRows = [];
  }
}
