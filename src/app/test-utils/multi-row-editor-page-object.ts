import { EditorPageObject } from './editor-page-object';

export abstract class MultiRowEditorPageObject<T> extends EditorPageObject<T> {
  readonly EDITOR_DT_SELECTOR = '#editor-table';

  get editorTable() { return this.query<HTMLElement>(this.EDITOR_DT_SELECTOR); }
  get deleteSelectedRowBtn() { return this.query<HTMLButtonElement>('#delete-selected-row-btn'); }
  get addNewRowBtn() { return this.query<HTMLButtonElement>('#add-new-row-btn'); }

  getEditorTableRowsCount() {
    return this.editorTable.querySelectorAll('datatable-row-wrapper').length;
  }
}
