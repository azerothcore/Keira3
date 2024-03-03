import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BsModalService } from 'ngx-bootstrap/modal';
import { QueryOutputComponentPage } from '../modules/query-output/query-output.component.spec';
import { TableRow } from '@keira/shared-constants';
import { PageObject } from './page-object';

export abstract class EditorPageObject<T> extends PageObject<T> {
  readonly PREVIEW_CONTAINER_SELECTOR = '.preview-container';
  protected readonly queryPo: QueryOutputComponentPage;

  get queryTypeSwitchWrapper(): HTMLDivElement {
    return this.query<HTMLDivElement>('.query-type-switch');
  }

  constructor(
    protected fixture: ComponentFixture<T>,
    config: { clearStorage: boolean } = { clearStorage: true },
  ) {
    super(fixture, config);
    this.queryPo = new QueryOutputComponentPage(fixture as ComponentFixture<any>);
  }

  changeAllFields<E extends TableRow>(entity: E, excludedFields: string[] = []) {
    let i = 0;
    for (const field of Object.getOwnPropertyNames(entity)) {
      if (!excludedFields.includes(field)) {
        if (!this.getInputById(field).disabled) {
          this.setInputValueById(field, i);
          i++;
        }
      }
    }
  }

  clickExecuteQuery() {
    this.clickElement(this.queryPo.executeBtn);
  }

  clickCopyQuery() {
    this.clickElement(this.queryPo.copyBtn);
  }

  getInputById(inputId: string) {
    return this.query<HTMLInputElement>(`#${inputId}`);
  }

  setInputValueById(inputId: string, value: string | number) {
    this.setInputValue(this.getInputById(inputId), value);
  }

  setSelectValueById(inputId: string, value: number) {
    this.setInputValueById(inputId, `${value}: ${value}`);
  }

  getSelectorBtn(name: string, assert = true) {
    return this.query<HTMLButtonElement>(`#${name}-selector-btn`, assert);
  }

  getCellOfTableExternal(tableSelector: string, rowIndex: number, colIndex: number): HTMLTableDataCellElement {
    const element = document.querySelector<HTMLTableDataCellElement>(
      `${tableSelector} tr:nth-child(${rowIndex + 1}) td:nth-child(${colIndex + 1})`,
    );
    expect(element).toBeTruthy(`Unable to find column ${colIndex} of row ${rowIndex} of ${tableSelector}`);
    return element;
  }

  toggleFlagInRowExternal(rowIndex: number) {
    const cell = this.getCellOfTableExternal('#flags-table', rowIndex, 0);
    const toggleSelector = 'ui-switch';
    const toggleElement = cell.querySelector<HTMLElement>(toggleSelector);
    expect(toggleElement).toBeTruthy(`Unable to find ${toggleSelector}`);
    this.clickElement(toggleElement);
  }

  clickModalSelect() {
    this.clickElement(this.queryOutsideComponent('#modal-select-btn'));

    // TODO: this shouldn't be necessary, but for some reasons the modal does not close so we manually close it
    //  see: https://stackoverflow.com/questions/57279830/ngx-bootstrap-modal-does-not-hide-during-test
    const modalService: BsModalService = TestBed.inject(BsModalService);
    modalService.hide();
  }

  clickModalCancel() {
    this.clickElement(this.queryOutsideComponent('#modal-cancel-btn'));
  }

  expectModalDisplayed() {
    this.queryOutsideComponent('.modal-content', true);
  }

  expectModalHidden() {
    expect(this.queryOutsideComponent('.modal-content', false)).toBeFalsy('Expected modal to be hidden');
  }

  clickSearchBtn() {
    this.clickElement(this.queryOutsideComponent('#search-btn'));
  }

  expectQuerySwitchToBeHidden() {
    expect(this.queryTypeSwitchWrapper.hidden).toBe(true, 'Expected query switch to be hidden');
  }

  expectFullQueryToBeShown() {
    this.queryPo.expectFullQueryToBeShown();
  }

  expectDiffQueryToBeShown() {
    this.queryPo.expectDiffQueryToBeShown();
  }

  expectFullQueryToContain(expectedQuery: string) {
    // can be useful when finding the correct query after an intended change:
    // console.log(this.queryPo.fullQueryWrapper.innerText);
    expect(this.queryPo.fullQueryWrapper.innerText).toContain(expectedQuery);
  }

  expectDiffQueryToContain(expectedQuery: string) {
    // can be useful when finding the correct query after an intended change:
    // console.log(this.queryPo.diffQueryWrapper.innerText);
    expect(this.queryPo.diffQueryWrapper.innerText).toContain(expectedQuery);
  }

  expectAllQueriesToContain(expectedQuery: string) {
    this.expectDiffQueryToContain(expectedQuery);
    this.expectFullQueryToContain(expectedQuery);
  }

  expectFullQueryToBeEmpty() {
    expect(this.queryPo.fullQueryWrapper.innerText).toEqual('');
  }

  expectDiffQueryToBeEmpty() {
    expect(this.queryPo.diffQueryWrapper.innerText).toEqual('');
  }
}
