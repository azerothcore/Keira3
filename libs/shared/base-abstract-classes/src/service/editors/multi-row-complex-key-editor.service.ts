import { Class, TableRow } from '@keira/shared/constants';
import { QueryError } from 'mysql2';
import { Observable } from 'rxjs';
import { HandlerService } from '../handlers/handler.service';
import { MultiRowEditorService } from './multi-row-editor.service';
import { ChangeDetectorRef } from '@angular/core';

export abstract class MultiRowComplexKeyEditorService<T extends TableRow> extends MultiRowEditorService<T> {
  get entityIdFields(): string[] {
    return JSON.parse(this._entityIdField as string);
  }

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  protected constructor(
    protected override _entityClass: Class,
    protected override _entityTable: string,
    _entityIdField: string[],
    protected override _entitySecondIdField: string,
    protected override handlerService: HandlerService<T>,
  ) {
    super(_entityClass, _entityTable, JSON.stringify(_entityIdField), _entitySecondIdField, handlerService);
  }

  protected override disableEntityIdField() {}

  protected override updateDiffQuery(): void {
    this._diffQuery = this.queryService.getDiffDeleteInsertTwoKeysQuery<T>(
      this._entityTable,
      this.entityIdFields,
      this._entitySecondIdField,
      this._originalRows,
      this._newRows,
    );

    this.updateEditorStatus();
  }

  protected abstract override updateFullQuery(): void;

  protected override addIdToNewRow(newRow: any): void {
    const obj = this._loadedEntityId as Partial<T>;

    for (const key of Object.keys(obj)) {
      newRow[key] = obj[key];
    }
  }

  override reload(changeDetectorRef: ChangeDetectorRef) {
    this._loading = true;
    this.reset();
    this.reloadEntity(changeDetectorRef);
  }

  protected override selectQuery(): Observable<T[]> {
    return this.queryService.selectAllMultipleKeys<T>(this._entityTable, JSON.parse(this.handlerService.selected));
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

  protected override onReloadSuccessful(data: T[]) {
    this.loadNewData(data);
    this._loadedEntityId = JSON.parse(this.handlerService.selected);
    this.updateFullQuery();
  }
}
