import { Observable } from 'rxjs';

import { Class, TableRow } from '@keira/shared/constants';
import { SingleRowEditorService } from './single-row-editor.service';
import { getPartial } from '@keira/shared/utils';
import { QueryError } from 'mysql2';
import { ChangeDetectorRef } from '@angular/core';

export abstract class SingleRowComplexKeyEditorService<T extends TableRow> extends SingleRowEditorService<T> {
  get entityIdFields(): string[] {
    return JSON.parse(this._entityIdField);
  }

  protected constructor(
    protected override _entityClass: Class,
    protected override _entityTable: string,
    _entityIdField: string[],
    protected override _entityNameField: string | undefined | null,
    protected override isMainEntity: boolean,
  ) {
    super(_entityClass, _entityTable, JSON.stringify(_entityIdField), _entityNameField, isMainEntity);
  }

  protected override disableEntityIdField() {}

  protected override selectQuery(): Observable<T[]> {
    return this.queryService.selectAllMultipleKeys<T>(this._entityTable, JSON.parse(this.handlerService.selected));
  }

  protected override updateDiffQuery(): void {
    this._diffQuery = this.queryService.getUpdateMultipleKeysQuery<T>(
      this._entityTable,
      this._originalValue,
      this._form.getRawValue() as T,
      this.entityIdFields,
    );

    this.updateEditorStatus();
  }

  protected override updateFullQuery(): void {
    const originalValue = this.isNew ? this._form.getRawValue() : this._originalValue;
    this._fullQuery = this.queryService.getFullDeleteInsertMultipleKeysQuery<T>(
      this._entityTable,
      originalValue as T,
      this._form.getRawValue() as T,
      this.entityIdFields,
    );
  }

  protected override reloadEntity(changeDetectorRef: ChangeDetectorRef) {
    this.subscriptions.push(
      this.selectQuery().subscribe({
        next: (data) => {
          this._error = undefined;
          this.onReloadSuccessful(data);
          this._loading = false;
          changeDetectorRef.markForCheck();
        },
        error: (error: QueryError) => {
          this._error = error;
          this._loading = false;
          changeDetectorRef.markForCheck();
        },
      }),
    );
  }

  override reload(changeDetectorRef: ChangeDetectorRef): void {
    this._loading = true;
    this.reset();
    this.reloadEntity(changeDetectorRef);
  }

  override reloadSameEntity(changeDetectorRef: ChangeDetectorRef): void {
    this._isNew = false;
    this.handlerService.select(false, getPartial<T>(this._form.getRawValue() as T, this.entityIdFields));
    this.reload(changeDetectorRef);
  }

  /*
   *  ****** OVERRIDES of onReloadSuccessful() and some of its helpers ******
   */
  protected override onCreatingNewEntity(): void {
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

  protected override setLoadedEntity(): void {
    const loadedEntity = getPartial<T>(this._originalValue, this.entityIdFields);
    this._loadedEntityId = JSON.stringify(loadedEntity);
    this.handlerService.select(this.handlerService.isNew, getPartial<T>(this._originalValue, this.entityIdFields));
  }

  protected override onReloadSuccessful(data: T[]): void {
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
