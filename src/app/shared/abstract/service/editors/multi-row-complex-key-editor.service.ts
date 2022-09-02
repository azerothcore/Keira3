import { Class, TableRow } from '@keira-types/general';
import { QueryError } from 'mysql2';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { MysqlQueryService } from '../../../services/mysql-query.service';
import { HandlerService } from '../handlers/handler.service';
import { MultiRowEditorService } from './multi-row-editor.service';

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
    readonly queryService: MysqlQueryService,
    protected toastrService: ToastrService,
  ) {
    super(_entityClass, _entityTable, JSON.stringify(_entityIdField), _entitySecondIdField, handlerService, queryService, toastrService);
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

    this.updateEditorStatus();
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

  protected selectQuery(): Observable<T[]> {
    return this.queryService.selectAllMultipleKeys<T>(this._entityTable, JSON.parse(this.handlerService.selected));
  }

  protected reloadEntity() {
    this.subscriptions.push(
      this.selectQuery().subscribe({
        next: (data) => {
          this._error = null;
          this.onReloadSuccessful(data);
          this._loading = false;
        },
        error: (error: QueryError) => {
          this._error = error;
          this._loading = false;
        },
      }),
    );
  }

  protected onReloadSuccessful(data: T[]) {
    this.loadNewData(data);
    this._loadedEntityId = JSON.parse(this.handlerService.selected);
    this.updateFullQuery();
  }
}
