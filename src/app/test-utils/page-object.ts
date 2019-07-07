import { ComponentFixture } from '@angular/core/testing';

export abstract class PageObject<ComponentType> {

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

  public setInputValue(inputElement: HTMLInputElement | HTMLSelectElement, value: string | number) {
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
}

