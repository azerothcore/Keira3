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
  private getDefaultSelectorIfNull(datatableSelector: string|null) {
    return datatableSelector ? datatableSelector : this.DT_SELECTOR;
  }

  /* internal selectors (querying the component) */

  getDatatableHeaderByTitle(text: string, assert = true, datatableSelector?: string): HTMLElement {
    datatableSelector = this.getDefaultSelectorIfNull(datatableSelector);
    return this.query(this.getDatatableHeaderByTitleSelector(datatableSelector, text), assert);
  }

  getDatatableRow(rowIndex: number, assert = true, datatableSelector?: string): HTMLElement {
    datatableSelector = this.getDefaultSelectorIfNull(datatableSelector);
    return this.query(this.getDatatableRowSelector(datatableSelector, rowIndex), assert);
  }

  getDatatableCell(rowIndex: number, colIndex: number, assert = true, datatableSelector?: string): HTMLElement {
    datatableSelector = this.getDefaultSelectorIfNull(datatableSelector);
    return this.query(this.getDatatableCellSelector(datatableSelector, rowIndex, colIndex), assert);
  }

  clickRowOfDatatable(rowIndex: number) {
    this.clickElement(this.getDatatableCell(rowIndex, 0));
  }

  /* external selectors (querying the document) */
  getDatatableHeaderByTitleExternal(text: string, assert = true, datatableSelector?: string): HTMLElement {
    datatableSelector = this.getDefaultSelectorIfNull(datatableSelector);
    const element: HTMLElement = document.querySelector(this.getDatatableHeaderByTitleSelector(datatableSelector, text));
    if (assert) {
      expect(element).toBeTruthy(`Unable to find text ${text} of ${datatableSelector}`);
    }
    return element;
  }

  getDatatableRowExternal(rowIndex: number, assert = true, datatableSelector?: string): HTMLElement {
    datatableSelector = this.getDefaultSelectorIfNull(datatableSelector);
    const element: HTMLElement = document.querySelector(this.getDatatableRowSelector(datatableSelector, rowIndex));
    if (assert) {
      expect(element).toBeTruthy(`Unable to find row ${rowIndex} of ${datatableSelector}`);
    }
    return element;
  }

  getDatatableCellExternal(rowIndex: number, colIndex: number, assert = true, datatableSelector?: string): HTMLElement {
    datatableSelector = this.getDefaultSelectorIfNull(datatableSelector);
    const element: HTMLElement = document.querySelector(this.getDatatableCellSelector(datatableSelector, rowIndex, colIndex));
    if (assert) {
      expect(element).toBeTruthy(`Unable to find column ${colIndex} of row ${rowIndex} of ${datatableSelector}`);
    }
    return element;
  }

  getCellOfDatatableInModal(rowIndex: number, colIndex: number, assert = true) {
    const datatableSelector = `.modal-content ${this.DT_SELECTOR}`;
    return this.getDatatableCellExternal(rowIndex, colIndex, true, datatableSelector);
  }

  clickRowOfDatatableInModal(rowIndex: number) {
    this.clickElement(this.getCellOfDatatableInModal(rowIndex, 0));
  }
}

