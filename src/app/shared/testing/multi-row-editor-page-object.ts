import { EditorPageObject } from './editor-page-object';

export abstract class MultiRowEditorPageObject<T> extends EditorPageObject<T> {
  readonly EDITOR_DT_SELECTOR = '#editor-table';

  get editorTable(): HTMLElement {
    return this.query<HTMLElement>(this.EDITOR_DT_SELECTOR);
  }
  get deleteSelectedRowBtn(): HTMLButtonElement {
    return this.query<HTMLButtonElement>('#delete-selected-row-btn');
  }
  get addNewRowBtn(): HTMLButtonElement {
    return this.query<HTMLButtonElement>('#add-new-row-btn');
  }
  get formError(): HTMLDivElement {
    return this.query<HTMLDivElement>('.form-error');
  }

  getEditorTableRowsCount(): number {
    return this.editorTable.querySelectorAll('datatable-row-wrapper').length;
  }

  addNewRow(): void {
    this.clickElement(this.addNewRowBtn);
  }

  deleteRow(rowIndex: number = 0): void {
    this.clickRowOfDatatable(rowIndex);
    this.clickElement(this.deleteSelectedRowBtn);
  }

  expectUniqueError(): void {
    expect(this.formError.hidden).toBe(false);
    expect(this.formError.innerText).toContain('must be unique');
  }
}
