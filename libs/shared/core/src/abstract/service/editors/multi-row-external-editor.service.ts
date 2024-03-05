import { Class, TableRow } from '@keira/shared/constants';
import { ToastrService } from 'ngx-toastr';
import { MysqlQueryService } from '../../../services/query/mysql-query.service';
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
    readonly queryService: MysqlQueryService,
    protected toastrService: ToastrService,
  ) {
    super(
      _entityClass,
      _entityTable,
      null, // none of the editors table's fields matches with the main entity ID
      _entitySecondIdField,
      handlerService,
      queryService,
      toastrService,
    );
  }

  disableEntityIdField() {}

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
