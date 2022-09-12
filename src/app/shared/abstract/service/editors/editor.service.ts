import { FormControl, FormGroup } from 'ngx-typesafe-forms';
import { Observable } from 'rxjs';
import { QueryError } from 'mysql2';
import { ToastrService } from 'ngx-toastr';

import { Class, StringKeys, TableRow } from '@keira-types/general';
import { MysqlQueryService } from '../../../services/mysql-query.service';
import { HandlerService } from '../handlers/handler.service';
import { SubscriptionHandler } from '../../../utils/subscription-handler/subscription-handler';

export abstract class EditorService<T extends TableRow> extends SubscriptionHandler {
  protected _loading = false;
  protected _loadedEntityId: string | number | Partial<T>;
  protected readonly fields: StringKeys<T>[];
  protected _diffQuery: string;
  protected _fullQuery: string;
  protected _isNew = false;
  protected _form: FormGroup<T>;
  protected _error: QueryError;

  get loadedEntityId(): string {
    return typeof this._loadedEntityId === 'object' ? JSON.stringify(this._loadedEntityId) : String(this._loadedEntityId);
  }
  get loading(): boolean {
    return this._loading;
  }
  get diffQuery(): string {
    return this._diffQuery;
  }
  get fullQuery(): string {
    return this._fullQuery;
  }
  get entityTable(): string {
    return this._entityTable;
  }
  get isNew(): boolean {
    return this._isNew;
  }
  get form(): FormGroup<T> {
    return this._form;
  }
  get error(): QueryError {
    return this._error;
  }

  constructor(
    protected _entityClass: Class,
    protected _entityTable: string,
    protected _entityIdField: string,
    protected handlerService: HandlerService<T>,
    readonly queryService: MysqlQueryService,
    protected toastrService: ToastrService,
  ) {
    super();
    this.fields = this.getClassAttributes(this._entityClass);
  }

  clearCache(): void {
    this.queryService.clearCache();
  }

  protected abstract updateDiffQuery();
  protected abstract updateFullQuery();
  protected abstract onReloadSuccessful(data: T[], id: string | number);

  protected updateEditorStatus() {
    this.handlerService.statusMap[this._entityTable] = !!this._diffQuery;
  }

  private getClassAttributes(c: Class): StringKeys<T>[] {
    const tmpInstance = new c();
    return Object.getOwnPropertyNames(tmpInstance) as StringKeys<T>[];
  }

  protected disableEntityIdField() {
    this._form.controls[this._entityIdField].disable();
  }

  protected initForm() {
    this._form = new FormGroup<T>({} as any);

    for (const field of this.fields) {
      this._form.addControl(field, new FormControl());
    }

    this.disableEntityIdField();
  }

  protected selectQuery(id: string | number): Observable<T[]> {
    return this.queryService.selectAll<T>(this._entityTable, this._entityIdField, id);
  }

  protected reloadEntity(id: string | number) {
    this.subscriptions.push(
      this.selectQuery(id).subscribe({
        next: (data) => {
          this._error = null;
          this.onReloadSuccessful(data, id);
          this._loading = false;
        },
        error: (error: QueryError) => {
          this._error = error;
          this._loading = false;
        },
      }),
    );
  }

  protected reset() {
    this._form.reset();
    this._fullQuery = '';
    this._diffQuery = '';
    this.updateEditorStatus();
  }

  reload(id: string | number) {
    this._loading = true;
    this.reset();
    this.reloadEntity(id);
  }

  reloadSameEntity() {
    this.reload(this.loadedEntityId);
  }

  save(query: string) {
    if (!query) {
      return;
    }

    this._loading = true;

    this.subscriptions.push(
      this.queryService.query<T>(query).subscribe({
        next: () => {
          this._error = null;
          this.reloadSameEntity();
          this.toastrService.success('Query executed successfully', 'Success');
          this._loading = false;
        },
        error: (error: QueryError) => {
          this._error = error;
          this.toastrService.error('Error when executing the query!', 'Query error');
          this._loading = false;
        },
      }),
    );
  }
}
