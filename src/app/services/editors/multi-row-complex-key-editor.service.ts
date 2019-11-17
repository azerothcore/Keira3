import { Class, MysqlResult, TableRow } from '../../types/general';
import { HandlerService } from '../handlers/handler.service';
import { QueryService } from '../query.service';
import { MultiRowEditorService } from './multi-row-editor.service';
import { Observable } from 'rxjs';
import { MysqlError } from 'mysql';

export abstract class MultiRowComplexKeyEditorService<T extends TableRow> extends MultiRowEditorService<T> {

  get entityIdFields(): string[] {
    return JSON.parse(this._entityIdField);
  }

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected _entityClass: Class,
    protected _entityTable: string,
    _entityIdField: string[],
    protected _entitySecondIdField: string,
    protected handlerService: HandlerService<T>,
    protected queryService: QueryService,
  ) {
    super(
      _entityClass,
      _entityTable,
      JSON.stringify(_entityIdField),
      _entitySecondIdField,
      handlerService,
      queryService,
    );
  }

  protected disableEntityIdField() {}

  protected updateDiffQuery(): void {
    this._diffQuery = this.queryService.getDiffDeleteInsertTwoKeysQuery<T>(
      this._entityTable,
      this.entityIdFields,
      this._entitySecondIdField,
      this._originalRows,
      this._newRows,
    );
  }

  protected abstract updateFullQuery(): void;

  protected addIdToNewRow(newRow): void {
    const obj = this._loadedEntityId as Partial<T>;

    for (const key in obj) {
      /* istanbul ignore else */
      if (obj.hasOwnProperty(key)) {
        newRow[key] = obj[key];
      }
    }
  }

  reload() {
    this._loading = true;
    this.reset();
    this.reloadEntity();
  }

  protected selectQuery(): Observable<MysqlResult<T>> {
    return this.queryService.selectAllMultipleKeys<T>(this._entityTable, JSON.parse(this.handlerService.selected));
  }

  protected reloadEntity() {
    this.subscriptions.push(
      this.selectQuery().subscribe((data) => {
        this._error = null;
        this.onReloadSuccessful(data);
      }, (error: MysqlError) => {
        this._error = error;
      }).add(() => {
        this._loading = false;
      })
    );
  }

  protected onReloadSuccessful(data: MysqlResult<T>) {
    this._originalRows = [];
    this._newRows = [];
    for (const row of data.results) {
      this._originalRows.push({ ...row });
      this._newRows.push({ ...row });
    }
    this._newRows = [...this._newRows];
    this._selectedRowId = null;
    this._form.disable();
    this._loadedEntityId = JSON.parse(this.handlerService.selected);
    this._nextRowId = 0;
    this.updateFullQuery();
  }
}
