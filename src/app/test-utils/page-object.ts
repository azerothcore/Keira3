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

  public setInputValue(inputElement: HTMLInputElement | HTMLSelectElement, value: string|number) {
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
  getDatatableHeaderByTitle(datatableSelector: string, text: string, assert = true): HTMLElement {
    return this.query(`${datatableSelector} .datatable-header-cell[title="${text}"]`, assert);
  }

  getDatatableRow(datatableSelector: string, rowIndex: number, assert = true): HTMLElement {
    return this.query(`${datatableSelector} .datatable-row-wrapper:nth-child(${rowIndex + 1})`, assert);
  }

  getDatatableCell(datatableSelector: string, rowIndex: number, colIndex: number, assert = true): HTMLElement {
    return this.query(
      `${datatableSelector} .datatable-row-wrapper:nth-child(${rowIndex + 1}) .datatable-body-cell:nth-child(${colIndex + 1})`,
      assert,
    );
  }
}

