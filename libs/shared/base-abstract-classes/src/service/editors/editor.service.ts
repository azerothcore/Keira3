import { QueryError } from 'mysql2';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject } from 'rxjs';
import { AbstractControl, FormControl, FormGroup, ValidationErrors } from '@angular/forms';

import { Class, StringKeys, TableRow } from '@keira/shared/constants';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { EditorSettingsService } from '@keira/shared/common-services';
import { ModelForm, SubscriptionHandler } from '@keira/shared/utils';
import { HandlerService } from '../handlers/handler.service';
import { registerTabState } from '../tab-state';
import { ChangeDetectorRef, inject, signal } from '@angular/core';

/** An empty number field: its column would get NULL (most of them can't have it). */
export const numberRequired = (control: AbstractControl): ValidationErrors | null =>
  control.value === null || control.value === '' ? { required: true } : null;

export abstract class EditorService<T extends TableRow> extends SubscriptionHandler {
  readonly queryService = inject(MysqlQueryService);
  protected readonly toastrService = inject(ToastrService);
  protected readonly editorSettings = inject(EditorSettingsService);

  protected _loading = false;
  protected _loadedEntityId: string | number | Partial<T> | undefined;
  protected fields: StringKeys<T>[] = [];
  protected _diffQuery: string | undefined;
  protected _fullQuery: string | undefined;
  protected _isNew = false;
  protected _form!: FormGroup<ModelForm<T>>;
  protected _error: QueryError | undefined;
  /** Bumped when another tab takes this editor over: the answers to what an earlier tab asked are dropped. */
  protected _tabGeneration = 0;
  /** Whether each query executed ran (true) or failed (false). */
  readonly saved = new Subject<boolean>();

  constructor() {
    super();
    // (each tab of this part of Keira keeps its own rows and changes)
    registerTabState(this);
  }

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
    const defaults = new this._entityClass() as Record<string, unknown>;

    for (const field of this.fields) {
      // (a number column left empty would be written as NULL: shown as a mistake, #3236)
      const control = new FormControl<T[typeof field]>(null as unknown as T[typeof field], {
        validators: typeof defaults[field] === 'number' ? [numberRequired] : [],
      });
      this._form.addControl(field, control as never);
    }

    this.disableEntityIdField();
  }

  protected selectQuery(id: string | number): Observable<T[]> {
    return this.queryService.selectAll<T>(this._entityTable, this._entityIdField as string, id);
  }

  protected reloadEntity(changeDetectorRef: ChangeDetectorRef, id?: string | number) {
    const generation = this._tabGeneration;
    this.subscriptions.push(
      this.selectQuery(id as string | number).subscribe({
        // TODO: fix typing, remove 'as' cast
        next: (data) => {
          if (generation !== this._tabGeneration) {
            return;
          }
          this._error = undefined;
          this.onReloadSuccessful(data, id as string | number); // TODO: fix typing, remove 'as' cast
          this._loading = false;
          changeDetectorRef.markForCheck();
        },
        error: (error: QueryError) => {
          if (generation !== this._tabGeneration) {
            return;
          }
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
    const generation = this._tabGeneration;

    this.subscriptions.push(
      this.queryService.query<T>(query).subscribe({
        next: () => {
          this.toastrService.success('Query executed successfully', 'Success');
          this.saved.next(true);
          // (another tab took this editor over meanwhile: the query ran, its tab reads its rows when shown again)
          if (generation !== this._tabGeneration) {
            return;
          }
          this._error = undefined;
          this.reloadSameEntity(changeDetectorRef);
          this._loading = false;
          changeDetectorRef.markForCheck();
        },
        error: (error: QueryError) => {
          this.toastrService.error('Error when executing the query!', 'Query error');
          this.saved.next(false);
          if (generation !== this._tabGeneration) {
            return;
          }
          this._error = error;
          this._loading = false;
          changeDetectorRef.markForCheck();
        },
      }),
    );
  }
}
