import { Class, TableRow } from '@keira/shared/constants';
import { ToastrService } from 'ngx-toastr';
import { distinctUntilChanged } from 'rxjs';
import { MysqlQueryService } from '../../../services/query/mysql-query.service';
import { HandlerService } from '../handlers/handler.service';
import { EditorService } from './editor.service';
import { compareObjFn } from '../../../utils/helpers';

export abstract class MultiRowEditorService<T extends TableRow> extends EditorService<T> {
  protected FIRST_ROW_START_VALUE = 0;
  protected _originalRows: T[] = [];
  protected _newRows: T[] = [];
  protected _selectedRowId: string | number;
  protected _nextRowId = this.FIRST_ROW_START_VALUE;
  protected _errors: string[] = [];

  get newRows(): T[] {
    return this._newRows;
  }
  get selectedRowId(): string | number {
    return this._selectedRowId;
  }
  get entitySecondIdField(): string {
    return this._entitySecondIdField;
  }

  /* istanbul ignore next */ // TODO: fix coverage
  get errors(): string[] {
    return this._errors;
  }

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected _entityClass: Class,
    protected _entityTable: string,
    protected _entityIdField: string,
    protected _entitySecondIdField: string,
    protected handlerService: HandlerService<T>,
    readonly queryService: MysqlQueryService,
    protected toastrService: ToastrService,
  ) {
    super(_entityClass, _entityTable, _entityIdField, handlerService, queryService, toastrService);
    this.initForm();
  }

  protected initForm(): void {
    super.initForm();

    this.subscriptions.push(
      this._form.valueChanges.pipe(distinctUntilChanged(compareObjFn)).subscribe(() => {
        if (!this._loading) {
          if (this._form.dirty && this.isFormIdUnique()) {
            this._newRows[this.getSelectedRowIndex()] = this._form.getRawValue() as T;
            this._newRows = [...this._newRows];
            this._selectedRowId = this.form.controls[this._entitySecondIdField].value;
            this.checkRowsCorrectness();
            this.updateDiffQuery();
            this.updateFullQuery();
          }
        }
      }),
    );
  }

  protected checkRowsCorrectness(): void {}

  private getRowIndex(id: string | number): number {
    for (let i = 0; i < this._newRows.length; i++) {
      if (id === this._newRows[i][this._entitySecondIdField]) {
        return i;
      }
    }

    console.error(`getRowIndex() failed in finding row having ${this._entitySecondIdField} ${id}`);
    return 0;
  }

  private getSelectedRowIndex(): number {
    return this.getRowIndex(this._selectedRowId);
  }

  protected onReloadSuccessful(data: T[], id: string | number) {
    this.loadNewData(data);
    this._loadedEntityId = id;
    this.updateFullQuery();
  }

  protected loadNewData(data: T[]) {
    this._errors = [];
    this._originalRows = [];
    this._newRows = [];
    for (const row of data) {
      this._originalRows.push({ ...row });
      this._newRows.push({ ...row });
    }
    this._newRows = [...this._newRows];
    this._selectedRowId = null;
    this._form.disable();
    this._nextRowId = this.FIRST_ROW_START_VALUE;
  }

  protected updateDiffQuery(): void {
    this._diffQuery = this.queryService.getDiffDeleteInsertTwoKeysQuery<T>(
      this._entityTable,
      this._entityIdField,
      this._entitySecondIdField,
      this._originalRows,
      this._newRows,
    );

    this.updateEditorStatus();
  }

  protected updateFullQuery(): void {
    this._fullQuery = this.queryService.getFullDeleteInsertQuery<T>(this._entityTable, this._newRows, this._entityIdField);
  }

  protected getNextFreeRowId(): number {
    while (this.isRowIdTaken(this._nextRowId)) {
      this._nextRowId++;
    }

    return this._nextRowId;
  }

  protected isRowIdTaken(id: number) {
    for (const row of this._newRows) {
      if (row[this._entitySecondIdField] === id) {
        return true;
      }
    }
    return false;
  }

  onRowSelection({ selected }: { selected: T[] }): void {
    const newId = selected[0][this._entitySecondIdField];

    if (newId === this._selectedRowId) {
      return;
    }

    this._loading = true;
    this._selectedRowId = newId;
    this._form.enable();
    this._form.reset();

    const index = this.getSelectedRowIndex();

    for (const field of this.fields) {
      const control = this._form.controls[field];
      /* istanbul ignore else */
      if (control) {
        control.setValue(this._newRows[index][field]);
      } else {
        console.error(`Control '${field}' does not exist!`);
        console.log(`----------- DEBUG CONTROL KEYS:`);
        for (const k of Object.keys(this._form.controls)) {
          console.log(k);
        }
      }
    }

    this.onRowSelected();

    this._loading = false;
  }

  protected onRowSelected(): void {}

  isRowSelected(row: T): boolean {
    return row[this._entitySecondIdField] === this._selectedRowId;
  }

  deleteSelectedRow(): void {
    if (this._selectedRowId === null) {
      return;
    }

    this._newRows.splice(this.getSelectedRowIndex(), 1);
    this._newRows = [...this._newRows];

    this._selectedRowId = null;
    this._form.reset();
    this._form.disable();

    this.updateDiffQuery();
    this.updateFullQuery();
  }

  protected addIdToNewRow(newRow): void {
    newRow[this._entityIdField] = Number.parseInt(this.loadedEntityId, 10);
  }

  addNewRow(): void {
    const newRow = new this._entityClass();
    if (this._entityIdField) {
      this.addIdToNewRow(newRow);
    }
    newRow[this._entitySecondIdField] = this.getNextFreeRowId();
    this._newRows = [...this._newRows, { ...newRow }];

    this.updateDiffQuery();
    this.updateFullQuery();

    this.onRowSelection({ selected: [newRow] });
  }

  isFormIdUnique(): boolean {
    for (const row of this._newRows) {
      if (
        row[this._entitySecondIdField] !== this._selectedRowId &&
        row[this._entitySecondIdField] === this._form.controls[this._entitySecondIdField].value
      ) {
        return false;
      }
    }

    return true;
  }

  refreshDatatable(): void {
    this._newRows = [...this._newRows];
  }
}
