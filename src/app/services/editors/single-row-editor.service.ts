import { distinctUntilChanged } from 'rxjs/operators';

import { Class, MysqlResult, TableRow } from '../../types/general';
import { QueryService } from '../query.service';
import { EditorService } from './editor.service';
import { HandlerService } from '../handlers/handler.service';
import { getNumberOrString } from '../../utils/helpers';

export abstract class SingleRowEditorService<T extends TableRow> extends EditorService<T> {
  private _originalValue: T;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected _entityClass: Class,
    protected _entityTable: string,
    protected _entityIdField: string,
    protected _entityNameField: string,
    protected isMainEntity: boolean,
    protected handlerService: HandlerService<T>,
    protected queryService: QueryService,
  ) {
    super(_entityClass, _entityTable, _entityIdField, handlerService, queryService);
    this.initForm();
  }

  protected initForm() {
    super.initForm();

    this.subscriptions.push(
      this._form.valueChanges.pipe(
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
      ).subscribe(() => {
        if (!this._loading) {
          if (this._form.dirty) {
            this.updateDiffQuery();
          }
          this.updateFullQuery();
        }
      })
    );
  }

  protected updateDiffQuery(): void {
    this._diffQuery = this.queryService.getUpdateQuery<T>(
      this._entityTable,
      this._entityIdField,
      this._originalValue,
      this._form.getRawValue(),
    );
  }

  protected updateFullQuery(): void {
    this._fullQuery = this.queryService.getFullDeleteInsertQuery<T>(
      this._entityTable,
      [this._form.getRawValue()],
      this._entityIdField,
    );
  }

  protected onReloadSuccessful(data: MysqlResult<T>, id: string|number) {
    if (data.results.length > 0) {
      // we are loading an existing entity
      this._originalValue = data.results[0];
      this._isNew = false;

      if (this.isMainEntity) {
        // we are loading an existing entity that has just been created
        this.handlerService.isNew = false;
        this.handlerService.selectedName = `${this._originalValue[this._entityNameField]}`;
      }

    } else {
      // we are creating a new entity
      this._originalValue = new this._entityClass();
      // TODO: get rid of this type hack, see: https://github.com/microsoft/TypeScript/issues/32704
      (this._originalValue as any)[this._entityIdField] = getNumberOrString(id);
      this._isNew = true;
    }

    this._loading = true;
    for (const field of this.fields) {
      this._form.get(field).setValue(this._originalValue[field]);
    }
    this._loading = false;

    this._loadedEntityId = this._originalValue[this._entityIdField];
    this.updateFullQuery();
  }
}
