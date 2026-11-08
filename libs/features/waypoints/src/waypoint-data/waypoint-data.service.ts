import { inject, Service, signal } from '@angular/core';
import { TableRow } from '@keira/shared/constants';
import { WAYPOINT_DATA_ID, WAYPOINT_DATA_ID_2, WAYPOINT_DATA_TABLE, WaypointData } from '@keira/shared/acore-world-model';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { WaypointHandlerService } from '../waypoint-handler.service';

/** The points of a path (`waypoint_data`), by point number. */
@Service()
export class WaypointDataService extends MultiRowEditorService<WaypointData> {
  protected override readonly handlerService = inject(WaypointHandlerService);
  protected override readonly _entityClass = WaypointData;
  protected override readonly _entityTable = WAYPOINT_DATA_TABLE;
  protected override readonly _entityIdField = WAYPOINT_DATA_ID;
  protected override readonly _entitySecondIdField = WAYPOINT_DATA_ID_2;
  /** (paths start at point 1) */
  protected override FIRST_ROW_START_VALUE = 1;
  /**
   * The table's columns in the database connected (older AzerothCore databases have no `velocity` nor
   * `smoothTransition`): what isn't one of them is left out of the queries. Undefined until read (or unreadable).
   */
  readonly columns = signal<Set<string> | undefined>(undefined);

  constructor() {
    super();
    this.init();
    this.subscriptions.push(
      this.queryService.query<TableRow>(`SHOW COLUMNS FROM \`${WAYPOINT_DATA_TABLE}\``).subscribe({
        next: (rows) => {
          this.columns.set(rows?.length ? new Set(rows.map((row) => String(row['Field']))) : undefined);
          this.updateFullQuery();
        },
        // (the queries keep every field)
        error: () => this.columns.set(undefined),
      }),
    );
  }

  /** Whether the database has a column (all are assumed until its columns are read). */
  hasColumn(name: string): boolean {
    return this.columns()?.has(name) ?? true;
  }

  /** Rows with only the database's columns. */
  private fit(rows: WaypointData[]): WaypointData[] {
    const columns = this.columns();
    return columns ? rows.map((row) => Object.fromEntries(Object.entries(row).filter(([key]) => columns.has(key))) as WaypointData) : rows;
  }

  protected override updateDiffQuery(): void {
    this._diffQuery = this.queryService.getDiffDeleteInsertTwoKeysQuery<WaypointData>(
      this._entityTable,
      this._entityIdField,
      this._entitySecondIdField,
      this.fit(this._originalRows),
      this.fit(this._newRows),
    );
    this.updateEditorStatus();
  }

  protected override updateFullQuery(): void {
    this._fullQuery = this.queryService.getFullDeleteInsertQuery<WaypointData>(
      this._entityTable,
      this.fit(this._newRows),
      this._entityIdField,
    );
  }
}
