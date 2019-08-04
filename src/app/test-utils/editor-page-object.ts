import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BsModalService } from 'ngx-bootstrap';

import { PageObject } from './page-object';
import { QueryOutputComponentPage } from '../components/editors/shared/query-output/query-output.component.spec';

export abstract class EditorPageObject<T> extends PageObject<T> {
  protected readonly queryPo: QueryOutputComponentPage;

  get queryTypeSwitchWrapper() { return this.query<HTMLDivElement>('.query-type-switch'); }

  constructor(
    protected fixture: ComponentFixture<T>,
    config: { clearStorage: boolean } = { clearStorage: true },
  ) {
    super(fixture, config);
    this.queryPo = new QueryOutputComponentPage(fixture as ComponentFixture<any>);
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

  getSelectorBtn(name: string) {
    return this.query<HTMLButtonElement>(`#${name}-selector-btn`);
  }

  getCellOfDatatableInModal(rowIndex: number, colIndex: number) {
    const element = this.getDatatableCell(this.DT_SELECTOR, rowIndex, colIndex);
    expect(element).toBeTruthy(`Unable to find column ${colIndex} of row ${rowIndex} of ${this.DT_SELECTOR}`);
    return element;
  }

  clickRowOfDatatable(rowIndex: number) {
    this.clickElement(this.getCellOfDatatableInModal(rowIndex, 0));
  }

  getCellOfTable(rowIndex: number, colIndex: number): HTMLTableDataCellElement {
    const tableSelector = '#flags-table';
    const element = document.querySelector<HTMLTableDataCellElement>(
      `${tableSelector} tr:nth-child(${rowIndex + 1}) td:nth-child(${colIndex + 1})`
    );
    console.log(`${tableSelector} tr:nth-child(${rowIndex + 1}) td:nth-child(${colIndex + 1})`);
    expect(element).toBeTruthy(`Unable to find column ${colIndex} of row ${rowIndex} of ${tableSelector}`);
    return element;
  }

  toggleFlagInRow(rowIndex: number) {
    const cell = this.getCellOfTable(rowIndex, 0);
    const toggleSelector = 'ui-switch';
    const toggleElement = cell.querySelector<HTMLElement>(toggleSelector);
    expect(toggleElement).toBeTruthy(`Unable to find ${toggleSelector}`);
    this.clickElement(toggleElement);
  }

  clickModalSelect() {
    this.clickElement(this.queryOutisdeComponent('#modal-select-btn'));

    // TODO: this shouldn't be necessary, but for some reasons the modal does not close so we manually close it
    //  see: https://stackoverflow.com/questions/57279830/ngx-bootstrap-modal-does-not-hide-during-test
    const modalService: BsModalService = TestBed.get(BsModalService);
    modalService.hide(1);
  }

  clickModalCancel() {
    this.clickElement(this.queryOutisdeComponent('#modal-cancel-btn'));
  }

  expectModalDisplayed() {
    this.queryOutisdeComponent('.modal-content', true);
  }

  expectModalHidden() {
    expect(this.queryOutisdeComponent('.modal-content', false))
      .toBeFalsy('Expected modal to be hidden');
  }

  clickItemSearchBtn() {
    this.clickElement(this.queryOutisdeComponent('#item-search-btn'));
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
    expect(this.queryPo.fullQueryWrapper.innerText).toContain(expectedQuery);
  }

  expectDiffQueryToContain(expectedQuery: string) {
    expect(this.queryPo.diffQueryWrapper.innerText).toContain(expectedQuery);
  }

  expectFullQueryToBeEmpty() {
    expect(this.queryPo.fullQueryWrapper.innerText).toEqual('');
  }

  expectDiffQueryToBeEmpty() {
    expect(this.queryPo.diffQueryWrapper.innerText).toEqual('');
  }

  /*** ngx-datatable utilities ***/
  getDatatableHeaderByTitle(datatableSelector: string, text: string): HTMLElement {
    return document.querySelector(`${datatableSelector} .datatable-header-cell[title="${text}"]`);
  }

  getDatatableRow(datatableSelector: string, rowIndex: number): HTMLElement {
    return document.querySelector(`${datatableSelector} .datatable-row-wrapper:nth-child(${rowIndex + 1})`);
  }

  getDatatableCell(datatableSelector: string, rowIndex: number, colIndex: number): HTMLElement {
    return document.querySelector(
      `${datatableSelector} .datatable-row-wrapper:nth-child(${rowIndex + 1}) .datatable-body-cell:nth-child(${colIndex + 1})`
    );
  }
}
