
import { ToastrService } from 'ngx-toastr';

import { MultiRowEditorService } from './multi-row-editor.service';
import { Class, TableRow } from '@keira-types/general';
import { HandlerService } from '../handlers/handler.service';
import { MysqlQueryService } from '../../../services/mysql-query.service';

// Used where none of the editors table's fields matches with the main entity ID. For example creature_addon (CreatureSpawnAddonService)

export abstract class MultiRowExternalEditorService<T extends TableRow> extends MultiRowEditorService<T> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected _entityClass: Class,
    protected _entityTable: string,
    protected _entitySecondIdField: string,
    protected handlerService: HandlerService<T>,
    protected queryService: MysqlQueryService,
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
    this._fullQuery = this.queryService.getFullDeleteInsertQuery<T>(
      this._entityTable,
      this._newRows,
      null,
      this._entitySecondIdField,
    );
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

  abstract selectQuery(id: string|number);
}
