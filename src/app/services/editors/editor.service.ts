import { FormControl, FormGroup } from '@angular/forms';

import { Class, MysqlResult, TableRow } from '../../types';
import { QueryService } from '../query.service';
import { HandlerService } from '../handlers/handler.service';

export abstract class EditorService<T extends TableRow> {
  protected _loading = false;
  protected _loadedEntityId: number | string;
  protected readonly fields: string[];
  protected _diffQuery: string;
  protected _fullQuery: string;
  protected _isNew = false;
  protected _form: FormGroup;

  get loadedEntityId(): string { return `${this._loadedEntityId}`; }
  get loading(): boolean { return this._loading; }
  get diffQuery(): string { return this._diffQuery; }
  get fullQuery(): string { return this._fullQuery; }
  get entityTable(): string { return this._entityTable; }
  get isNew(): boolean { return this._isNew; }
  get form(): FormGroup { return this._form; }

  constructor(
    protected _entityClass: Class,
    protected _entityTable: string,
    protected _entityIdField: string,
    protected handlerService: HandlerService<T>,
    protected queryService: QueryService,
  ) {
    this.fields = this.getClassAttributes(this._entityClass);
  }

  protected abstract updateDiffQuery();
  protected abstract updateFullQuery();
  protected abstract onReloadSuccessful(data: MysqlResult<T>, id: string|number);

  private getClassAttributes(c: Class): string[] {
    const tmpInstance = new c();
    return Object.getOwnPropertyNames(tmpInstance);
  }

  protected initForm() {
    this._form = new FormGroup({});

    for (const field of this.fields) {
      this._form.addControl(field, new FormControl());
    }

    this._form.get(this._entityIdField).disable();
  }

  reload(id: string|number) {
    this._loading = true;
    this._form.reset();
    this._fullQuery = '';
    this._diffQuery = '';

    this.queryService.selectAll<T>(this._entityTable, this._entityIdField, id).subscribe((data) => {
      this.onReloadSuccessful(data, id);
    }, (error) => {
      // TODO
      // console.log(error);
    }, () => {
      this._loading = false;
    });
  }

  save(query: string) {
    this.queryService.query<T>(query).subscribe(() => {
      this._loading = false;
      this.reload(this.loadedEntityId);
    }, (error) => {
      // TODO
      console.log(error);
    }, () => {
      this._loading = false;
    });
  }
}
