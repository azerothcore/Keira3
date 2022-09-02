import { Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { TableRow, Class } from '@keira-types/general';
import { SingleRowEditorService } from './single-row-editor.service';
import { HandlerService } from '../handlers/handler.service';
import { MysqlQueryService } from '../../../services/mysql-query.service';
import { getPartial } from '../../../utils/helpers';
import { QueryError } from 'mysql2';

export abstract class SingleRowComplexKeyEditorService<T extends TableRow> extends SingleRowEditorService<T> {
  get entityIdFields(): string[] {
    return JSON.parse(this._entityIdField);
  }

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected _entityClass: Class,
    protected _entityTable: string,
    _entityIdField: string[],
    protected _entityNameField: string,
    protected isMainEntity: boolean,
    protected handlerService: HandlerService<T>,
    readonly queryService: MysqlQueryService,
    protected toastrService: ToastrService,
  ) {
    super(
      _entityClass,
      _entityTable,
      JSON.stringify(_entityIdField),
      _entityNameField,
      isMainEntity,
      handlerService,
      queryService,
      toastrService,
    );
  }

  protected disableEntityIdField() {}

  protected selectQuery(): Observable<T[]> {
    return this.queryService.selectAllMultipleKeys<T>(this._entityTable, JSON.parse(this.handlerService.selected));
  }

  protected updateDiffQuery(): void {
    this._diffQuery = this.queryService.getUpdateMultipleKeysQuery<T>(
      this._entityTable,
      this._originalValue,
      this._form.getRawValue(),
      this.entityIdFields,
    );

    this.updateEditorStatus();
  }

  protected updateFullQuery(): void {
    const originalValue = this.isNew ? this._form.getRawValue() : this._originalValue;
    this._fullQuery = this.queryService.getFullDeleteInsertMultipleKeysQuery<T>(
      this._entityTable,
      originalValue,
      this._form.getRawValue(),
      this.entityIdFields,
    );
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

  reload() {
    this._loading = true;
    this.reset();
    this.reloadEntity();
  }

  reloadSameEntity() {
    this._isNew = false;
    this.handlerService.select(false, getPartial<T>(this._form.getRawValue(), this.entityIdFields));
    this.reload();
  }

  /*
   *  ****** OVERRIDES of onReloadSuccessful() and some of its helpers ******
   */
  protected onCreatingNewEntity() {
    this._originalValue = new this._entityClass();
    const selected: Partial<T> = JSON.parse(this.handlerService.selected);

    for (const key of this.entityIdFields) {
      if (selected[key]) {
        // TODO: get rid of this type hack, see: https://github.com/microsoft/TypeScript/issues/32704
        (this._originalValue as any)[key] = selected[key];
      }
    }

    this._isNew = true;
  }

  protected setLoadedEntity() {
    const loadedEntity = getPartial<T>(this._originalValue, this.entityIdFields);
    this._loadedEntityId = JSON.stringify(loadedEntity);
    this.handlerService.select(this.handlerService.isNew, getPartial<T>(this._originalValue, this.entityIdFields));
  }

  protected onReloadSuccessful(data: T[]) {
    if (!this.handlerService.isNew) {
      // we are loading an existing entity
      this.onLoadedExistingEntity(data[0]);
    } else {
      // we are creating a new entity
      this.onCreatingNewEntity();
    }
    this.updateFormAfterReload();
    this.setLoadedEntity();
    this.updateFullQuery();
  }
  /* ****** */
}
