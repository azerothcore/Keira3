import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageObject } from './page-object';
import { QueryOutputComponentPage } from '../components/editors/shared/query-output/query-output.component.spec';
import { BsModalService } from 'ngx-bootstrap';

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

  getInput(name: string) {
    return this.query<HTMLInputElement>(`#${name}`);
  }

  getSelectorBtn(name: string) {
    return this.query<HTMLButtonElement>(`#${name}-selector-btn`);
  }

  clickRowOfDatatableInModal(rowIndex: number) {
    const element = this.getDatatableCell(this.DT_SELECTOR, rowIndex, 0);
    expect(element).toBeTruthy(`Unable to find column 0 of row ${rowIndex} of ${this.DT_SELECTOR}`);
    this.clickElement(element);
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
