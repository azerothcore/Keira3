import { ComponentFixture } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

export abstract class PageObject<ComponentType> {
  readonly DT_SELECTOR = 'ngx-datatable';

  constructor(
    protected fixture: ComponentFixture<ComponentType>,
    config: { clearStorage: boolean } = { clearStorage: true },
  ) {
    if (config.clearStorage) {
      localStorage.clear();
    }
  }

  whenStable(): Promise<any> {
    return this.fixture.whenStable();
  }

  async whenReady(): Promise<void> {
    await this.fixture.whenStable();
    await this.fixture.whenRenderingDone();
  }

  detectChanges(): void {
    this.fixture.detectChanges();
  }

  removeElement(): void {
    this.fixture.debugElement.nativeElement.remove();
  }

  query<T extends HTMLElement>(selector: string, assert = true): T {
    const element: T = this.fixture.nativeElement.querySelector(selector);

    if (assert) {
      expect(element).toBeTruthy(`Element with selector "${selector}" was not found.`);
    }

    return element;
  }

  queryInsideElement<T extends HTMLElement>(element: HTMLElement, selector: string, assert = true): HTMLElement {
    const child: T = element.querySelector<T>(selector);

    if (assert) {
      expect(child).toBeTruthy(`Element with selector "${selector}" inside "${element.tagName}" was not found.`);
    }

    return child;
  }

  queryAll<T extends HTMLElement>(selector: string): T[] {
    return this.fixture.nativeElement.querySelectorAll(selector);
  }

  queryAllInsideElement<T extends HTMLElement>(element: HTMLElement, selector: string, assert = true): T[] {
    const children: T[] = Array.from(element.querySelectorAll<T>(selector));

    if (assert) {
      expect(children).toBeTruthy(`Element with selector "${selector}" inside "${element.tagName}" was not found.`);
    }

    return children;
  }

  public setInputValue(inputElement: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, value: string | number): void {
    inputElement.value = `${value}`;
    inputElement.dispatchEvent(new Event('input'));
    inputElement.dispatchEvent(new Event('change'));
    inputElement.dispatchEvent(new Event('blur'));
    this.fixture.detectChanges();
  }

  getLabel(fieldName: string): HTMLLabelElement {
    return this.query<HTMLLabelElement>(`.control-label[for="${fieldName}"]`);
  }
  getInput(fieldName: string): HTMLInputElement {
    return this.query<HTMLInputElement>(`input.form-control[id="${fieldName}"]`);
  }
  expectInputVisible(fieldName: string): void {
    expect(this.getLabel(fieldName)).toBeDefined();
    expect(this.getInput(fieldName)).toBeDefined();
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

  isHidden(element: HTMLElement): boolean {
    return element.hasAttribute('hidden');
  }

  queryOutsideComponent<T extends HTMLElement>(selector: string, assert = true): T {
    const element: T = document.querySelector<T>(selector);

    if (assert) {
      expect(element).toBeTruthy(`Global element with selector "${selector}" was not found.`);
    }

    return element;
  }

  get queryWrapper(): HTMLElement {
    return this.query<HTMLElement>('#no-highlight-query-wrapper');
  }

  getDebugElementByCss(cssSelector: string, assert = true): DebugElement {
    const debugElement = this.fixture.debugElement.query(By.css(cssSelector));

    if (assert) {
      expect(debugElement).withContext(`Element with selector "${cssSelector}" was not found.`).toBeTruthy();
    }

    return debugElement;
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
  private getDefaultSelectorIfNull(datatableSelector: string | null): string {
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

  clickRowOfDatatable(rowIndex: number): void {
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

  getCellOfDatatableInModal(rowIndex: number, colIndex: number): HTMLElement {
    const datatableSelector = `.modal-content ${this.DT_SELECTOR}`;
    return this.getDatatableCellExternal(rowIndex, colIndex, true, datatableSelector);
  }

  clickRowOfDatatableInModal(rowIndex: number): void {
    this.clickElement(this.getCellOfDatatableInModal(rowIndex, 0));
  }

  /*** ngx-bootstrap Tabs utilities ***/

  getTab(tabsetId: string, tabId: string): HTMLElement {
    return this.query(`tabset#${tabsetId} a#${tabId}-link`);
  }

  expectTabActive(tab: HTMLElement): void {
    expect(tab).toHaveClass('active');
  }

  expectTabInactive(tab: HTMLElement): void {
    expect(tab).not.toHaveClass('active');
  }

  expectTabHeadToContain(tab: HTMLElement, text: string): void {
    expect(tab.innerText).toContain(text);
  }
}
