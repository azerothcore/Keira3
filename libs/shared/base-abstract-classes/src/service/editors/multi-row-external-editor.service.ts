import { Class, TableRow } from '@keira/shared/constants';
import { MultiRowEditorService } from './multi-row-editor.service';
import { Observable } from 'rxjs';

// Used where none of the editors table's fields matches with the main entity ID. For example creature_addon (CreatureSpawnAddonService)

export abstract class MultiRowExternalEditorService<T extends TableRow> extends MultiRowEditorService<T> {
  protected constructor(
    protected override _entityClass: Class,
    protected override _entityTable: string,
    protected override _entitySecondIdField: string,
  ) {
    super(
      _entityClass,
      _entityTable,
      undefined, // none of the editors table's fields matches with the main entity ID
      _entitySecondIdField,
    );
  }

  override disableEntityIdField() {}

  /* istanbul ignore next */ // TODO: fix coverage
  protected override updateFullQuery(): void {
    this._fullQuery = this.queryService.getFullDeleteInsertQuery<T>(this._entityTable, this._newRows, null, this._entitySecondIdField);

    this.updateEditorStatus();
  }

  protected override updateDiffQuery(): void {
    this._diffQuery = this.queryService.getDiffDeleteInsertTwoKeysQuery<T>(
      this._entityTable,
      undefined,
      this._entitySecondIdField,
      this._originalRows,
      this._newRows,
    );
  }

  abstract override selectQuery(id: string | number): Observable<T[]>;
}
