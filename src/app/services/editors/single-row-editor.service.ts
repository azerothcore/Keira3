import { Class, TableRow } from '../../types';
import { QueryService } from '../query.service';
import { EditorService } from './editor.service';
import { HandlerService } from '../handlers/handler.service';

export abstract class SingleRowEditorService<T extends TableRow> extends EditorService<T> {
  private _originalValue: T;

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

  reload(id: string|number) {
    this._loading = true;
    this._form.reset();
    this._fullQuery = '';
    this._diffQuery = '';

    this.queryService.selectAll<T>(this._entityTable, this._entityIdField, id).subscribe((data) => {

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
        this._originalValue[this._entityIdField] = id;
        this._isNew = true;
      }

      for (const field of this.fields) {
        this._form.get(field).setValue(this._originalValue[field]);
      }

      this._loadedEntityId = this._originalValue[this._entityIdField];
      this.updateFullQuery();
    }, (error) => {
      // TODO
      // console.log(error);
    }, () => {
      this._loading = false;
    });
  }
}
