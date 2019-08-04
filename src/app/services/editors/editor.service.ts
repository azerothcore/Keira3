import { FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { MysqlError } from 'mysql';

import { Class, MysqlResult, TableRow } from '../../types/general';
import { QueryService } from '../query.service';
import { HandlerService } from '../handlers/handler.service';
import { SubscriptionHandler } from '../../utils/subscription-handler/subscription-handler';

export abstract class EditorService<T extends TableRow> extends SubscriptionHandler {
  protected _loading = false;
  protected _loadedEntityId: string | number;
  protected readonly fields: string[];
  protected _diffQuery: string;
  protected _fullQuery: string;
  protected _isNew = false;
  protected _form: FormGroup;
  protected _error: MysqlError;

  get loadedEntityId(): string { return `${this._loadedEntityId}`; }
  get loading(): boolean { return this._loading; }
  get diffQuery(): string { return this._diffQuery; }
  get fullQuery(): string { return this._fullQuery; }
  get entityTable(): string { return this._entityTable; }
  get isNew(): boolean { return this._isNew; }
  get form(): FormGroup { return this._form; }
  get error(): MysqlError { return this._error; }

  constructor(
    protected _entityClass: Class,
    protected _entityTable: string,
    protected _entityIdField: string,
    protected handlerService: HandlerService<T>,
    protected queryService: QueryService,
  ) {
    super();
    this.fields = this.getClassAttributes(this._entityClass);
  }

  protected abstract updateDiffQuery();
  protected abstract updateFullQuery();
  protected abstract onReloadSuccessful(data: MysqlResult<T>, id: string|number);

  private getClassAttributes(c: Class): string[] {
    const tmpInstance = new c();
    return Object.getOwnPropertyNames(tmpInstance);
  }

  protected disableEntityIdField() {
    this._form.get(this._entityIdField).disable();
  }

  protected initForm() {
    this._form = new FormGroup({});

    for (const field of this.fields) {
      this._form.addControl(field, new FormControl());
    }

    this.disableEntityIdField();
  }

  protected selectQuery(id: string|number): Observable<MysqlResult<T>> {
    return this.queryService.selectAll<T>(this._entityTable, this._entityIdField, id);
  }

  reload(id: string|number) {
    this._loading = true;
    this._form.reset();
    this._fullQuery = '';
    this._diffQuery = '';

    this.selectQuery(id).subscribe((data) => {
      this._error = null;
      this.onReloadSuccessful(data, id);
    }, (error: MysqlError) => {
      this._error = error;
    }).add(() => {
      this._loading = false;
    });
  }

  save(query: string) {
    if (!query) { return; }

    this._loading = true;

    this.queryService.query<T>(query).subscribe(() => {
      this._error = null;
      this.reload(this.loadedEntityId);
    }, (error: MysqlError) => {
      this._error = error;
    }).add(() => {
      this._loading = false;
    });
  }
}
