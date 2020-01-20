import { EditorPageObject } from './editor-page-object';

export abstract class MultiRowEditorPageObject<T> extends EditorPageObject<T> {
  readonly EDITOR_DT_SELECTOR = '#editor-table';

  get editorTable() { return this.query<HTMLElement>(this.EDITOR_DT_SELECTOR); }
  get deleteSelectedRowBtn() { return this.query<HTMLButtonElement>('#delete-selected-row-btn'); }
  get addNewRowBtn() { return this.query<HTMLButtonElement>('#add-new-row-btn'); }
  get formError() { return this.query<HTMLDivElement>('.form-error'); }

  getEditorTableRowsCount() {
    return this.editorTable.querySelectorAll('datatable-row-wrapper').length;
  }

  addNewRow() {
    this.clickElement(this.addNewRowBtn);
  }

  deleteRow(rowIndex: number) {
    this.clickRowOfDatatable(rowIndex);
    this.clickElement(this.deleteSelectedRowBtn);
  }

  expectUniqueError() {
    expect(this.formError.hidden).toBe(false);
    expect(this.formError.innerText).toContain('must be unique');
  }
}
