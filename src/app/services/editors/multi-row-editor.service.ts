import { distinctUntilChanged } from 'rxjs/operators';

import { Class, MysqlResult, TableRow } from '../../types';
import { EditorService } from './editor.service';
import { HandlerService } from '../handlers/handler.service';
import { QueryService } from '../query.service';

export abstract class MultiRowEditorService<T extends TableRow> extends EditorService<T> {
  private _originalRow: T[] = [];
  private _newRows: T[] = [];
  private _selectedRowIdx: number;

  constructor(
    protected _entityClass: Class,
    protected _entityTable: string,
    protected _entityIdField: string,
    protected handlerService: HandlerService<T>,
    protected queryService: QueryService,
  ) {
    super(_entityClass, _entityTable, _entityIdField, handlerService, queryService);
    this.initForm();
  }

  protected initForm() {
    super.initForm();

    this._form.valueChanges.pipe(
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
    ).subscribe(() => {
      if (!this._loading) {
        if (this._form.dirty) {
          this._newRows[this._selectedRowIdx] = this._form.getRawValue();
          this.updateDiffQuery();
        }
        this.updateFullQuery();
      }
    });
  }

  onRowSelection(newIdx: number): void {
    if (newIdx === this._selectedRowIdx) {
      return;
    }

    this._loading = true;
    this._selectedRowIdx = newIdx;
    this._form.reset();

    for (const field of this.fields) {
      this._form.get(field).setValue(this._newRows[newIdx][field]);
    }

    this._loading = false;
  }

  protected onReloadSuccessful(data: MysqlResult<T>, id: string|number) {
    for (const row of data.results) {
      this._originalRow.push({ ...row });
      this._newRows.push({ ...row });
    }
    this._selectedRowIdx = null;
    this._form.disable();
    this._loadedEntityId = id;
    this.updateFullQuery();
  }
}
