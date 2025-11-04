import { FormGroup } from '@angular/forms';
import { Class, TableRow } from '@keira/shared/constants';
import { compareObjFn, ModelForm } from '@keira/shared/utils';
import { distinctUntilChanged } from 'rxjs';
import { EditorService } from './editor.service';

export abstract class MultiRowEditorService<T extends TableRow> extends EditorService<T> {
  protected FIRST_ROW_START_VALUE = 0;
  protected _originalRows: T[] = [];
  protected _newRows: T[] = [];
  protected _selectedRowId: string | number | undefined;
  protected _nextRowId = this.FIRST_ROW_START_VALUE;
  protected _errors: string[] = [];

  get newRows(): T[] {
    return this._newRows;
  }
  get selectedRowId(): string | number | undefined {
    return this._selectedRowId;
  }
  hasSelectedRow(): boolean {
    return this._selectedRowId !== undefined && this._selectedRowId !== null;
  }
  get entitySecondIdField(): string {
    return this._entitySecondIdField;
  }

  /* istanbul ignore next */ // TODO: fix coverage
  get errors(): string[] {
    return this._errors;
  }

  protected abstract override readonly _entityClass: Class;
  protected abstract override readonly _entityTable: string;
  protected abstract override readonly _entityIdField: string | undefined;
  protected abstract readonly _entitySecondIdField: string;
  protected readonly _entityExtraIdField: string | undefined = undefined;

  protected override init(): void {
    super.init();
    this.initForm();
  }

  private getRowIndex(id: string | number): number {
    for (let i = 0; i < this._newRows.length; i++) {
      if (id === this.getNewRowId(this._newRows[i])) {
        return i;
      }
    }

    if (this._entityExtraIdField) {
      const [entitySecondIdField, extraIdField] = `${id}`.split('_');
      console.error(`getRowIndex() failed in finding row having ${this._entitySecondIdField} ${entitySecondIdField} and ${extraIdField}`);
    } else {
      console.error(`getRowIndex() failed in finding row having ${this._entitySecondIdField} ${id}`);
    }

    return 0;
  }

  private getSelectedRowIndex(): number {
    return this.getRowIndex(this._selectedRowId as number);
  }

  private getSelectedRow(): T {
    return this._newRows[this.getSelectedRowIndex()];
  }

  protected override initForm(): void {
    super.initForm();

    this.subscriptions.push(
      this._form.valueChanges.pipe(distinctUntilChanged(compareObjFn)).subscribe(() => {
        if (!this._loading) {
          if (this._form.dirty && this.isFormIdUnique()) {
            this._newRows[this.getSelectedRowIndex()] = this._form.getRawValue() as T;
            this._newRows = [...this._newRows];
            this._selectedRowId = this.getNewRowIdForm(this._form.controls);
            this.checkRowsCorrectness();
            this.updateDiffQuery();
            this.updateFullQuery();
          }
        }
      }),
    );
  }

  protected checkRowsCorrectness(): void {}

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
    this._selectedRowId = undefined;
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
    const searchId = id.toString();
    for (const row of this._newRows) {
      const rowId = row[this._entitySecondIdField].toString();
      if (rowId === searchId) {
        return true;
      }
    }
    return false;
  }

  onRowSelection({ selected }: { selected: T[] }): void {
    const newId = this.getNewRowId(selected[0]);

    if (newId === this._selectedRowId) {
      return;
    }

    this._loading = true;
    this._selectedRowId = newId;
    this._form.enable();
    this._form.reset();

    const selectedRow = this.getSelectedRow();

    for (const field of this.fields) {
      const control = this._form.controls[field];
      /* istanbul ignore else */
      if (control) {
        control.setValue(selectedRow[field]);
      } else {
        console.error(`Control '${field}' does not exist!`);
        console.info(`----------- DEBUG CONTROL KEYS:`);
        for (const k of Object.keys(this._form.controls)) {
          console.info(k);
        }
      }
    }

    this.onRowSelected();

    this._loading = false;
  }

  protected onRowSelected(): void {}

  isRowSelected(row: T): boolean {
    return this.getNewRowId(row) === this._selectedRowId;
  }

  deleteSelectedRow(): void {
    if (this._selectedRowId === null || this._selectedRowId === undefined) {
      return;
    }

    this._newRows.splice(this.getSelectedRowIndex(), 1);
    this._newRows = [...this._newRows];

    this._selectedRowId = undefined;
    this._form.reset();
    this._form.disable();

    this.updateDiffQuery();
    this.updateFullQuery();
  }

  protected addIdToNewRow(newRow: T): void {
    newRow[this._entityIdField as keyof T] = Number.parseInt(this.loadedEntityId, 10) as T[keyof T];
  }

  private getNewRowId(row: T): string | number {
    if (this._entityExtraIdField) {
      return `${row[this._entitySecondIdField]}_${row[this._entityExtraIdField]}`;
    }

    return row[this._entitySecondIdField];
  }

  private getNewRowIdForm(rowControls: FormGroup<ModelForm<T>>['controls']): string | number {
    if (this._entityExtraIdField) {
      return `${rowControls[this._entitySecondIdField].value}_${rowControls[this._entityExtraIdField].value}`;
    }

    return rowControls[this._entitySecondIdField].value;
  }

  addNewRow(copySelectedRow = false): void {
    const newRow: T = copySelectedRow && this.hasSelectedRow() ? { ...this.getSelectedRow() } : new this._entityClass();
    if (this._entityIdField) {
      this.addIdToNewRow(newRow);
    }
    const nextId = this.getNextFreeRowId();
    newRow[this._entitySecondIdField as keyof T] =
      typeof newRow[this._entitySecondIdField as keyof T] === 'string' ? (String(nextId) as T[keyof T]) : (nextId as T[keyof T]);
    this._newRows = [...this._newRows, { ...newRow }];

    this.updateDiffQuery();
    this.updateFullQuery();

    this.onRowSelection({ selected: [newRow] });
  }

  isFormIdUnique(): boolean {
    for (const row of this._newRows) {
      if (this.getNewRowId(row) !== this._selectedRowId && this.getNewRowId(row) === this.getNewRowIdForm(this._form.controls)) {
        return false;
      }
    }

    return true;
  }

  refreshDatatable(): void {
    this._newRows = [...this._newRows];
  }
}
