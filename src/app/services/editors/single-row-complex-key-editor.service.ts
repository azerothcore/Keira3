import { Observable } from 'rxjs';

import { MysqlResult, TableRow, Class } from '../../types/general';
import { SingleRowEditorService } from './single-row-editor.service';
import { HandlerService } from '../handlers/handler.service';
import { QueryService } from '../query.service';
import { getPartial } from '../../utils/helpers';
import { MysqlError } from 'mysql';

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
    return this.queryService.selectAllMultipleKeys<T>(this._entityTable, JSON.parse(this.handlerService.selected));
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

  protected reloadEntity() {
    this.selectQuery().subscribe((data) => {
      this._error = null;
      this.onReloadSuccessful(data);
    }, (error: MysqlError) => {
      this._error = error;
    }).add(() => {
      this._loading = false;
    });
  }

  reload() {
    this._loading = true;
    this.reset();
    this.reloadEntity();
  }

  protected reloadCallback() {
    this.reload();
  }

  /*
   *  ****** OVERRIDES of onReloadSuccessful() and some of its helpers ******
   */
  protected onCreatingNewEntity() {
    this._originalValue = new this._entityClass();
    const selected: Partial<T> = JSON.parse(this.handlerService.selected);

    for (const key of this.entityIdFields) {
      // TODO: get rid of this type hack, see: https://github.com/microsoft/TypeScript/issues/32704
      (this._originalValue as any)[key] = selected[key];
    }

    this._isNew = true;
  }

  protected setLoadedEntity() {
    const loadedEntity = getPartial<T>(this._originalValue, this.entityIdFields);
    this._loadedEntityId = JSON.stringify(loadedEntity);
    this.handlerService.select(this._isNew, getPartial<T>(this._originalValue, this.entityIdFields));
  }

  protected onReloadSuccessful(data: MysqlResult<T>) {
    if (data.results.length > 0) {
      // we are loading an existing entity
      this.onLoadedExistingEntity(data.results[0]);
    } else {
      this.onCreatingNewEntity();
    }
    this.updateFormAfterReload();
    this.setLoadedEntity();
    this.updateFullQuery();
  }
  /* ****** */
}
