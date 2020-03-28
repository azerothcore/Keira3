import { ComponentFixture } from '@angular/core/testing';

export abstract class PageObject<ComponentType> {
  public readonly DT_SELECTOR = 'ngx-datatable';

  constructor(
    protected fixture: ComponentFixture<ComponentType>,
    config: { clearStorage: boolean } = { clearStorage: true },
  ) {
    if (config.clearStorage) {
      localStorage.clear();
    }
  }

  whenStable() {
    return this.fixture.whenStable();
  }

  async whenReady() {
    await this.fixture.whenStable();
    await this.fixture.whenRenderingDone();
  }

  detectChanges() {
    this.fixture.detectChanges();
  }

  query<T extends HTMLElement>(selector: string, assert = true): T {
    const element: T = this.fixture.nativeElement.querySelector(selector);

    if (assert) {
      expect(element).toBeTruthy(`Element with selector "${selector}" was not found.`);
    }

    return element;
  }

  queryInsideElement<T extends HTMLElement>(element: HTMLElement, selector: string, assert = true) {
    const child: T = element.querySelector<T>(selector);

    if (assert) {
      expect(child).toBeTruthy(`Element with selector "${selector}" inside "${element.tagName}" was not found.`);
    }

    return child;
  }

  queryAll<T extends HTMLElement>(selector: string): T[] {
    return this.fixture.nativeElement.querySelectorAll(selector);
  }

  queryAllInsideElement<T extends HTMLElement>(element: HTMLElement, selector: string, assert = true) {
    const children: T[] = Array.from(element.querySelectorAll<T>(selector));

    if (assert) {
      expect(children).toBeTruthy(`Element with selector "${selector}" inside "${element.tagName}" was not found.`);
    }

    return children;
  }

  public setInputValue(inputElement: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, value: string|number) {
    inputElement.value = `${value}`;
    inputElement.dispatchEvent(new Event('input'));
    inputElement.dispatchEvent(new Event('change'));
    inputElement.dispatchEvent(new Event('blur'));
    this.fixture.detectChanges();
  }

  clickElement(element: HTMLElement): void {
    element.click();
    this.fixture.detectChanges();
  }

  clickElements(elements: HTMLElement[]): void {
    for (const element of elements) {
      element.click();
    }
    this.fixture.detectChanges();
  }

  isHidden(element: HTMLElement) {
    return element.hasAttribute('hidden');
  }

  queryOutisdeComponent<T extends HTMLElement>(selector: string, assert = true): T {
    const element: T = document.querySelector<T>(selector);

    if (assert) {
      expect(element).toBeTruthy(`Global element with selector "${selector}" was not found.`);
    }

    return element;
  }

  /*** ngx-datatable utilities ***/

  /* selector string generators */
  private getDatatableHeaderByTitleSelector(datatableSelector: string, text: string): string {
    return `${datatableSelector} .datatable-header-cell[title="${text}"]`;
  }
  private getDatatableRowSelector(datatableSelector: string, rowIndex: number): string {
    return `${datatableSelector} .datatable-row-wrapper:nth-child(${rowIndex + 1})`;
  }
  private getDatatableCellSelector(datatableSelector: string, rowIndex: number, colIndex: number): string {
    return `${datatableSelector} .datatable-row-wrapper:nth-child(${rowIndex + 1}) .datatable-body-cell:nth-child(${colIndex + 1})`;
  }

  /* internal selectors (querying the component) */
  private getDefaultSelectorIfNull(datatableSelector: string|null) {
    return datatableSelector ? datatableSelector : this.DT_SELECTOR;
  }

  getDatatableHeaderByTitle(datatableSelector: string|null, text: string, assert = true): HTMLElement {
    datatableSelector = this.getDefaultSelectorIfNull(datatableSelector);
    return this.query(this.getDatatableHeaderByTitleSelector(datatableSelector, text), assert);
  }

  getDatatableRow(datatableSelector: string|null, rowIndex: number, assert = true): HTMLElement {
    datatableSelector = this.getDefaultSelectorIfNull(datatableSelector);
    return this.query(this.getDatatableRowSelector(datatableSelector, rowIndex), assert);
  }

  getDatatableCell(datatableSelector: string|null, rowIndex: number, colIndex: number, assert = true): HTMLElement {
    datatableSelector = this.getDefaultSelectorIfNull(datatableSelector);
    return this.query(this.getDatatableCellSelector(datatableSelector, rowIndex, colIndex), assert);
  }

  clickRowOfDatatable(rowIndex: number) {
    this.clickElement(this.getDatatableCell(this.DT_SELECTOR, rowIndex, 0));
  }

  /* external selectors (querying the document) */
  getDatatableHeaderByTitleExternal(datatableSelector: string, text: string): HTMLElement {
    return document.querySelector(this.getDatatableHeaderByTitleSelector(datatableSelector, text));
  }

  getDatatableRowExternal(datatableSelector: string, rowIndex: number): HTMLElement {
    return document.querySelector(this.getDatatableRowSelector(datatableSelector, rowIndex));
  }

  getDatatableCellExternal(datatableSelector: string, rowIndex: number, colIndex: number): HTMLElement {
    return document.querySelector(this.getDatatableCellSelector(datatableSelector, rowIndex, colIndex));
  }

  getCellOfDatatableInModal(rowIndex: number, colIndex: number) {
    const element = this.getDatatableCellExternal(`.modal-content ${this.DT_SELECTOR}`, rowIndex, colIndex);
    expect(element).toBeTruthy(`Unable to find column ${colIndex} of row ${rowIndex} of ${this.DT_SELECTOR}`);
    return element;
  }

  clickRowOfDatatableInModal(rowIndex: number) {
    this.clickElement(this.getCellOfDatatableInModal(rowIndex, 0));
  }
}

