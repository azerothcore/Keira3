import { FormControl, FormGroup } from '@angular/forms';
import { MysqlError } from 'mysql';

import { Class, TableRow } from '../../types/general';
import { QueryService } from '../query.service';
import { SubscriptionHandler } from '../../utils/subscription-handler/subscription-handler';
import { distinctUntilChanged } from 'rxjs/operators';

export abstract class SingleRowComplexKeyEditorService<T extends TableRow> extends SubscriptionHandler {
  protected _loading = false;
  protected readonly fields: string[];
  protected _fullQuery: string;
  protected _form: FormGroup;
  protected _error: MysqlError;
  private _originalValue: T;

  get loading(): boolean { return this._loading; }
  get fullQuery(): string { return this._fullQuery; }
  get entityTable(): string { return this._entityTable; }
  get form(): FormGroup { return this._form; }
  get error(): MysqlError { return this._error; }

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected _entityClass: Class,
    protected _entityTable: string,
    protected _entityIdFields: string[],
    protected queryService: QueryService,
  ) {
    super();
    this.fields = this.getClassAttributes(this._entityClass);

    this.subscriptions.push(
      this._form.valueChanges.pipe(
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
      ).subscribe(() => {
        if (!this._loading) {
          this.updateFullQuery();
        }
      })
    );
  }

  private getClassAttributes(c: Class): string[] {
    const tmpInstance = new c();
    return Object.getOwnPropertyNames(tmpInstance);
  }

  protected initForm() {
    this._form = new FormGroup({});

    for (const field of this.fields) {
      this._form.addControl(field, new FormControl());
    }
  }

  protected updateFullQuery() {
    // TODO
  }
}
