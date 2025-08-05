import { QueryError } from 'mysql2';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';

import { Class, StringKeys, TableRow } from '@keira/shared/constants';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { ModelForm, SubscriptionHandler } from '@keira/shared/utils';
import { HandlerService } from '../handlers/handler.service';
import { ChangeDetectorRef, inject, signal } from '@angular/core';

export abstract class EditorService<T extends TableRow> extends SubscriptionHandler {
  readonly queryService = inject(MysqlQueryService);
  protected readonly toastrService = inject(ToastrService);

  protected _loading = false;
  protected _loadedEntityId: string | number | Partial<T> | undefined;
  protected fields: StringKeys<T>[] = [];
  protected _diffQuery: string | undefined;
  protected _fullQuery: string | undefined;
  protected _isNew = false;
  protected _form!: FormGroup<ModelForm<T>>;
  protected _error: QueryError | undefined;

  /* istanbul ignore next */ // TODO: fix coverage
  get loadedEntityId(): string {
    return typeof this._loadedEntityId === 'object' ? JSON.stringify(this._loadedEntityId) : String(this._loadedEntityId);
  }
  get loading(): boolean {
    return this._loading;
  }
  get diffQuery(): string {
    return this._diffQuery as string;
  }
  get fullQuery(): string {
    return this._fullQuery as string;
  }
  get entityTable(): string {
    return this._entityTable;
  }
  get isNew(): boolean {
    return this._isNew;
  }
  get form(): FormGroup<ModelForm<T>> {
    return this._form as FormGroup<ModelForm<T>>;
  }
  get error(): QueryError {
    return this._error as QueryError;
  }

  protected abstract handlerService: HandlerService<T>;
  protected abstract _entityClass: Class;
  protected abstract _entityTable: string;
  protected abstract _entityIdField: string | undefined;

  protected init(): void {
    this.fields = this.getClassAttributes(this._entityClass);
  }

  /* istanbul ignore next */ // TODO: fix coverage
  clearCache(): void {
    this.queryService.clearCache();
  }

  protected abstract updateDiffQuery(): void;
  protected abstract updateFullQuery(): void;
  protected abstract onReloadSuccessful(data: T[], id: string | number): void;

  /* istanbul ignore next */ // TODO: fix coverage
  protected updateEditorStatus(): void {
    if (!this.handlerService.statusMap[this._entityTable]) {
      this.handlerService.statusMap[this._entityTable] = signal(false);
    }
    this.handlerService.statusMap[this._entityTable].set(!!this._diffQuery);
  }

  private getClassAttributes(c: Class): StringKeys<T>[] {
    const tmpInstance = new c();
    return Object.getOwnPropertyNames(tmpInstance) as StringKeys<T>[];
  }

  protected disableEntityIdField(): void {
    this._form.controls[this._entityIdField as string].disable();
  }

  protected initForm(): void {
    this._form = new FormGroup<ModelForm<T>>({} as any);

    for (const field of this.fields) {
      this._form.addControl(field, new FormControl());
    }

    this.disableEntityIdField();
  }

  protected selectQuery(id: string | number): Observable<T[]> {
    return this.queryService.selectAll<T>(this._entityTable, this._entityIdField as string, id);
  }

  protected reloadEntity(changeDetectorRef: ChangeDetectorRef, id?: string | number) {
    this.subscriptions.push(
      this.selectQuery(id as string | number).subscribe({
        // TODO: fix typing, remove 'as' cast
        next: (data) => {
          this._error = undefined;
          this.onReloadSuccessful(data, id as string | number); // TODO: fix typing, remove 'as' cast
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

  protected reset(): void {
    this._form.reset();
    this._fullQuery = '';
    this._diffQuery = '';
    this.updateEditorStatus();
  }

  reload(changeDetectorRef: ChangeDetectorRef, id?: string | number) {
    this._loading = true;
    this.reset();
    this.reloadEntity(changeDetectorRef, id);
  }

  reloadSameEntity(changeDetectorRef: ChangeDetectorRef): void {
    this.reload(changeDetectorRef, this.loadedEntityId);
  }

  save(changeDetectorRef: ChangeDetectorRef, query: string | undefined): void {
    if (!query) {
      return;
    }

    this._loading = true;

    this.subscriptions.push(
      this.queryService.query<T>(query).subscribe({
        next: () => {
          this._error = undefined;
          this.reloadSameEntity(changeDetectorRef);
          this.toastrService.success('Query executed successfully', 'Success');
          this._loading = false;
          changeDetectorRef.markForCheck();
        },
        error: (error: QueryError) => {
          this._error = error;
          this.toastrService.error('Error when executing the query!', 'Query error');
          this._loading = false;
          changeDetectorRef.markForCheck();
        },
      }),
    );
  }
}
