import { MysqlResult, TableRow } from '../../types/general';
import { SingleRowEditorService } from './single-row-editor.service';
import { Observable } from 'rxjs';

export abstract class SingleRowComplexKeyEditorService<T extends TableRow> extends SingleRowEditorService<T> {

  protected disableEntityIdField() {}

  protected selectQuery(id: string|number): Observable<MysqlResult<T>> {
    // TODO
    return this.queryService.selectAll<T>(this._entityTable, this._entityIdField, id);
  }

  protected updateDiffQuery(): void {
    // TODO
    this._diffQuery = this.queryService.getUpdateQuery<T>(
      this._entityTable,
      this._entityIdField,
      this._originalValue,
      this._form.getRawValue(),
    );
  }

  protected updateFullQuery(): void {
    // TODO
    this._fullQuery = this.queryService.getFullDeleteInsertQuery<T>(
      this._entityTable,
      [this._form.getRawValue()],
      this._entityIdField,
    );
  }
}
