import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableRow } from '@keira/shared/constants';
import { BsModalService } from 'ngx-bootstrap/modal';
import { PageObject } from './keira-page-object';
import { QueryOutputComponentPage } from './query-output-page-object';

export abstract class EditorPageObject<T> extends PageObject<T> {
  readonly PREVIEW_CONTAINER_SELECTOR = '.preview-container';
  protected readonly queryPo: QueryOutputComponentPage<unknown>;

  get queryTypeSwitchWrapper(): HTMLDivElement {
    return this.query<HTMLDivElement>('.query-type-switch');
  }

  constructor(
    public override fixture: ComponentFixture<T>,
    config: { clearStorage: boolean } = { clearStorage: true },
  ) {
    super(fixture, config);
    this.queryPo = new QueryOutputComponentPage(fixture as ComponentFixture<any>);
  }

  changeAllFields<E extends TableRow>(entity: E, excludedFields: string[] = [], values: (string | number)[] = []): void {
    let i = 0;
    for (const field of Object.getOwnPropertyNames(entity)) {
      if (!excludedFields.includes(field)) {
        if (!this.getInputById(field).disabled) {
          if (this.getInputById(field) instanceof HTMLSelectElement) {
            const value = values.length ? values[i] : i;
            this.setSelectValueById(field, value);
          } else {
            this.setInputValueById(field, i);
          }

          i++;
        }
      }
    }
  }

  /**
   * Iterates every own property of `entity` and drives the corresponding form control.
   * - HTMLSelectElement       -> setSelectValueById
   * - element whose `#${field}` host contains an `ngx-select` child -> setNgxSelectValueByIndex
   * - otherwise               -> setInputValueById
   *
   * Returns a record of { fieldName -> valueWritten } that downstream assertions can iterate.
   * Skips disabled inputs and fields listed in `excludedFields`.
   *
   * Unlike `changeAllFields`, this variant actively drives ngx-select-backed fields
   * via the existing `setNgxSelectValueByIndex` helper (picking option index 1, so it
   * differs from the default index 0).
   */
  async changeAllFieldsAsync<E extends TableRow>(entity: E, excludedFields: string[] = []): Promise<Record<string, string | number>> {
    const written: Record<string, string | number> = {};
    let i = 0;
    const root = this.fixture.debugElement.nativeElement as HTMLElement;
    for (const field of Object.getOwnPropertyNames(entity)) {
      if (excludedFields.includes(field)) continue;
      const input = this.getInputById(field);
      if (input?.disabled) continue;

      const ngxSelectHost = root.querySelector(`#${field} ngx-select`);
      // Some wrappers (e.g. keira-generic-option-selector for option lists without icons,
      // keira-boolean-option-selector) render a native <select> child inside the #${field} host.
      const nestedSelect = !ngxSelectHost && !(input instanceof HTMLSelectElement) ? root.querySelector(`#${field} select`) : null;

      if (ngxSelectHost) {
        await this.setNgxSelectValueByIndex(field, 1);
        written[field] = 1;
      } else if (input instanceof HTMLSelectElement) {
        this.setSelectValueById(field, i);
        written[field] = i;
      } else if (nestedSelect instanceof HTMLSelectElement) {
        // Pick the first non-disabled option whose value differs from the current one
        // so that a diff is forced.
        const options = Array.from(nestedSelect.options);
        const currentValue = nestedSelect.value;
        const target = options.find((o) => !o.disabled && o.value !== currentValue) ?? options[0];
        if (target) {
          this.setInputValue(nestedSelect, target.value);
          written[field] = target.value;
        }
      } else {
        // For text/number inputs, force a value that differs from the current so the
        // field always shows up in the diff query (avoids the i=0 vs default-0 collision).
        const previous = input?.value;
        const next = String(i) === previous ? i + 1 : i;
        this.setInputValueById(field, next);
        written[field] = next;
      }
      i++;
    }
    return written;
  }

  clickExecuteQuery(): void {
    this.clickElement(this.queryPo.executeBtn);
  }

  clickCopyQuery(): void {
    this.clickElement(this.queryPo.copyBtn);
  }

  setSelectValueById(inputId: string, value: string | number): void {
    /*
     * the <select> value is always "index: value"
     * index is the position index of the <option> tag
     * value is the option value (ngValue)
     *
     * usually, the index matches the ngValue if the value is an auto-increment number
     * otherwise, it could not match and in the tests, we specify the full select value as "index: value" and not only "x"
     */

    if (typeof value === 'string') {
      this.setInputValueById(inputId, `${value}`); // value = "index: value"
    } else {
      this.setInputValueById(inputId, `${value}: ${value}`); // the value is a number that matches the index
    }
  }

  getSelectorBtn(name: string, assert = true): HTMLButtonElement {
    return this.query<HTMLButtonElement>(`#${name}-selector-btn`, assert);
  }

  getCellOfTableExternal(tableSelector: string, rowIndex: number, colIndex: number): HTMLTableCellElement {
    const element = document.querySelector<HTMLTableCellElement>(
      `${tableSelector} tr:nth-child(${rowIndex + 1}) td:nth-child(${colIndex + 1})`,
    ) as HTMLTableCellElement;
    expect(element).toBeTruthy(`Unable to find column ${colIndex} of row ${rowIndex} of ${tableSelector}`);
    return element;
  }

  toggleFlagInRowExternal(rowIndex: number): void {
    const cell = this.getCellOfTableExternal('#flags-table', rowIndex, 0);
    const toggleSelector = 'ui-switch';
    const toggleElement = cell.querySelector<HTMLElement>(toggleSelector) as HTMLElement;
    expect(toggleElement).toBeTruthy(`Unable to find ${toggleSelector}`);
    this.clickElement(toggleElement);
  }

  clickModalSelect(): void {
    this.clickElement(this.queryOutsideComponent('#modal-select-btn'));

    // TODO: this shouldn't be necessary, but for some reasons the modal does not close so we manually close it
    //  see: https://stackoverflow.com/questions/57279830/ngx-bootstrap-modal-does-not-hide-during-test
    const modalService: BsModalService = TestBed.inject(BsModalService);
    modalService.hide();
  }

  clickModalCancel(): void {
    this.clickElement(this.queryOutsideComponent('#modal-cancel-btn'));
  }

  expectModalDisplayed(): void {
    this.queryOutsideComponent('.modal-content', true);
  }

  expectModalHidden(): void {
    expect(this.queryOutsideComponent('.modal-content', false)).toBeFalsy('Expected modal to be hidden');
  }

  clickSearchBtn(): void {
    this.clickElement(this.queryOutsideComponent('#search-btn'));
  }

  expectQuerySwitchToBeHidden(): void {
    expect(this.queryTypeSwitchWrapper.hidden).toBe(true, 'Expected query switch to be hidden');
  }

  expectFullQueryToBeShown(): void {
    this.queryPo.expectFullQueryToBeShown();
  }

  expectDiffQueryToBeShown(): void {
    this.queryPo.expectDiffQueryToBeShown();
  }

  expectFullQueryToContain(expectedQuery: string): void {
    // can be useful when finding the correct query after an intended change:
    // console.log(this.queryPo.fullQueryWrapper.innerText);
    expect(this.queryPo.fullQueryWrapper.innerText).toContain(expectedQuery);
  }

  expectDiffQueryToContain(expectedQuery: string): void {
    // can be useful when finding the correct query after an intended change:
    // console.log(this.queryPo.diffQueryWrapper.innerText);
    expect(this.queryPo.diffQueryWrapper.innerText).toContain(expectedQuery);
  }

  expectAllQueriesToContain(expectedQuery: string): void {
    this.expectDiffQueryToContain(expectedQuery);
    this.expectFullQueryToContain(expectedQuery);
  }

  expectFullQueryToBeEmpty(): void {
    expect(this.queryPo.fullQueryWrapper.innerText).toEqual('');
  }

  expectDiffQueryToBeEmpty(): void {
    expect(this.queryPo.diffQueryWrapper.innerText).toEqual('');
  }

  /**
   * Opens the #<fieldId>-selector-btn modal, expects the flags table to be displayed,
   * toggles each bit in `bitIndices`, clicks the Select button, and returns the
   * numeric value now visible in #<fieldId>.
   */
  async openFlagsAndToggle(fieldId: string, bitIndices: number[]): Promise<number> {
    this.clickElement(this.getSelectorBtn(fieldId));
    this.expectModalDisplayed();
    await this.whenReady();

    for (const bit of bitIndices) {
      this.toggleFlagInRowExternal(bit);
      await this.whenReady();
    }

    this.clickModalSelect();
    await this.whenReady();

    return Number(this.getInputById(fieldId).value);
  }

  /**
   * Opens the #<fieldId>-selector-btn modal, optionally clicks search,
   * clicks the row at `rowIndex` inside the modal's datatable, clicks Select,
   * and returns the value now visible in #<fieldId>.
   */
  async openSelectorAndPickRow(fieldId: string, rowIndex: number, opts: { clickSearch?: boolean } = {}): Promise<string> {
    this.clickElement(this.getSelectorBtn(fieldId));
    await this.whenReady();
    this.expectModalDisplayed();

    if (opts.clickSearch) {
      this.clickSearchBtn();
      await this.fixture.whenStable();
    }

    this.clickRowOfDatatableInModal(rowIndex);
    await this.whenReady();
    this.clickModalSelect();
    await this.whenReady();

    return this.getInputById(fieldId).value;
  }

  /**
   * Format a value the way squel emits it: strings quoted with single-quotes,
   * numbers and other primitives left as-is.
   */
  private formatSqlValue(value: string | number): string {
    return typeof value === 'string' ? `'${value}'` : `${value}`;
  }

  /** Build a `\`col\` = value` fragment matching squel formatting. */
  private formatColumnAssignment(col: string, value: string | number): string {
    return `\`${col}\` = ${this.formatSqlValue(value)}`;
  }

  /**
   * Asserts the diff query contains an UPDATE on `table` with the given WHERE and SET fields.
   * The matcher only inspects the SET prefix and WHERE; it does not enforce column order.
   */
  expectDiffQueryToUpdate(table: string, where: Record<string, string | number>, fields: Record<string, string | number>): void {
    const setParts = Object.keys(fields).map((col) => this.formatColumnAssignment(col, fields[col]));
    const whereParts = Object.keys(where).map((col) => this.formatColumnAssignment(col, where[col]));
    const expected = `UPDATE \`${table}\` SET ${setParts.join(', ')} WHERE (${whereParts.join(') AND (')});`;
    this.expectDiffQueryToContain(expected);
  }

  private formatInsertValues(rows: (string | number)[][]): string {
    return rows.map((row) => `(${row.map((v) => this.formatSqlValue(v)).join(', ')})`).join(',\n');
  }

  private formatColumnList(columns: string[]): string {
    return columns.map((c) => `\`${c}\``).join(', ');
  }

  /**
   * Asserts the diff query contains a DELETE...WHERE...IN(...) followed by INSERT INTO `table`
   * with the given rows.
   */
  expectDiffQueryToDeleteInsert(
    table: string,
    primaryKey: string,
    primaryKeyValue: string | number,
    secondaryKey: string,
    secondaryKeyValues: (string | number)[],
    columns: string[],
    rows: (string | number)[][],
  ): void {
    const pk = this.formatSqlValue(primaryKeyValue);
    const sks = secondaryKeyValues.map((v) => this.formatSqlValue(v)).join(', ');
    const cols = this.formatColumnList(columns);
    const values = this.formatInsertValues(rows);
    const expected =
      `DELETE FROM \`${table}\` WHERE (\`${primaryKey}\` = ${pk}) AND (\`${secondaryKey}\` IN (${sks}));\n` +
      `INSERT INTO \`${table}\` (${cols}) VALUES\n` +
      `${values};`;
    this.expectDiffQueryToContain(expected);
  }

  /** Asserts the full query rebuilds `table` with an INSERT of the given rows. */
  expectFullQueryToInsert(table: string, columns: string[], rows: (string | number)[][]): void {
    const cols = this.formatColumnList(columns);
    const values = this.formatInsertValues(rows);
    const expected = `INSERT INTO \`${table}\` (${cols}) VALUES\n${values};`;
    this.expectFullQueryToContain(expected);
  }

  /**
   * Asserts that a `ngx-toastr` error toast is visible in the DOM.
   * NOTE: requires `ToastrModule.forRoot()` in the TestBed (not a mocked ToastrService).
   */
  expectErrorToastVisible(textContains?: string): void {
    const toast = document.querySelector('.ngx-toastr.toast-error');
    expect(toast).toBeTruthy('Expected an error toast to be visible');
    if (textContains) {
      expect(toast?.textContent).toContain(textContains);
    }
  }

  /**
   * Asserts that a `ngx-toastr` success toast is visible in the DOM.
   * NOTE: requires `ToastrModule.forRoot()` in the TestBed (not a mocked ToastrService).
   */
  expectSuccessToastVisible(textContains?: string): void {
    const toast = document.querySelector('.ngx-toastr.toast-success');
    expect(toast).toBeTruthy('Expected a success toast to be visible');
    if (textContains) {
      expect(toast?.textContent).toContain(textContains);
    }
  }
}
