import { Observable } from 'rxjs';

import { MysqlResult, TableRow, Class } from '../../types/general';
import { SingleRowEditorService } from './single-row-editor.service';
import { HandlerService } from '../handlers/handler.service';
import { QueryService } from '../query.service';

export abstract class SingleRowComplexKeyEditorService<T extends TableRow> extends SingleRowEditorService<T> {

  get entityIdFields(): string[] {
    return JSON.parse(this._entityIdField);
  }

  constructor(
    protected _entityClass: Class,
    protected _entityTable: string,
    _entityIdField: string[],
    protected _entityNameField: string,
    protected isMainEntity: boolean,
    protected handlerService: HandlerService<T>,
    protected queryService: QueryService,
  ) {
    super(
      _entityClass,
      _entityTable,
      JSON.stringify(_entityIdField),
      _entityNameField,
      isMainEntity,
      handlerService,
      queryService,
    );
  }

  protected disableEntityIdField() {}

  protected selectQuery(): Observable<MysqlResult<T>> {
    return this.queryService.selectAllMultipleKeys<T>(this._entityTable, this._originalValue);
  }

  protected updateDiffQuery(): void {
    this._diffQuery = this.queryService.getUpdateMultipleKeysQuery<T>(
      this._entityTable,
      this._originalValue,
      this._form.getRawValue(),
      this.entityIdFields,
    );
  }

  protected updateFullQuery(): void {
    this._fullQuery = this.queryService.getFullDeleteInsertMultipleKeysQuery<T>(
      this._entityTable,
      this._originalValue,
      this._form.getRawValue(),
      this.entityIdFields,
    );
  }
}
