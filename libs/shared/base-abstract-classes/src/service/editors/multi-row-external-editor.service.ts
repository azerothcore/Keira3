import { Class, TableRow } from '@keira/shared/constants';
import { HandlerService } from '../handlers/handler.service';
import { MultiRowEditorService } from './multi-row-editor.service';

// Used where none of the editors table's fields matches with the main entity ID. For example creature_addon (CreatureSpawnAddonService)

export abstract class MultiRowExternalEditorService<T extends TableRow> extends MultiRowEditorService<T> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected _entityClass: Class,
    protected _entityTable: string,
    protected _entitySecondIdField: string,
    protected handlerService: HandlerService<T>,
  ) {
    super(
      _entityClass,
      _entityTable,
      null, // none of the editors table's fields matches with the main entity ID
      _entitySecondIdField,
      handlerService,
    );
  }

  disableEntityIdField() {}

  /* istanbul ignore next */ // TODO: fix coverage
  protected updateFullQuery(): void {
    this._fullQuery = this.queryService.getFullDeleteInsertQuery<T>(this._entityTable, this._newRows, null, this._entitySecondIdField);

    this.updateEditorStatus();
  }

  protected updateDiffQuery(): void {
    this._diffQuery = this.queryService.getDiffDeleteInsertTwoKeysQuery<T>(
      this._entityTable,
      null,
      this._entitySecondIdField,
      this._originalRows,
      this._newRows,
    );
  }

  abstract selectQuery(id: string | number);
}
