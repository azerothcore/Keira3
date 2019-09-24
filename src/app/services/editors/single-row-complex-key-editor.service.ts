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

  // TODO: update handler selection on save


  protected reloadEntity(id: string) {
    this.selectQuery().subscribe((data) => {
      this._error = null;
      this.onReloadSuccessful(data, id);
    }, (error: MysqlError) => {
      this._error = error;
    }).add(() => {
      this._loading = false;
    });
  }

  protected reset() {
    this._form.reset();
    this._fullQuery = '';
    this._diffQuery = '';
  }

  reload(id: string) {
    this._loading = true;
    this.reset();
    this.reloadEntity(id);
  }

  protected reloadCallback() {
    this.reload(this.loadedEntityId);
  }

  save(query: string) {
    if (!query) { return; }

    this._loading = true;

    this.queryService.query<T>(query).subscribe(() => {
      this._error = null;
      this.reloadCallback();
    }, (error: MysqlError) => {
      this._error = error;
    }).add(() => {
      this._loading = false;
    });
  }
}
