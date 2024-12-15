import { Type } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { DebugHtmlElement } from './debug-html-element';

export abstract class PageObjectModel<ComponentType> {
  constructor(public readonly fixture: ComponentFixture<ComponentType>) {}

  protected getSelectorByTestId(testId: string): string {
    return `[data-testid="${testId}"]`;
  }

  detectChanges(): void {
    this.fixture.detectChanges();
  }

  getDebugElementByCss<HTMLElementType extends HTMLElement = HTMLElement>(
    cssSelector: string,
    assert = true,
  ): DebugHtmlElement<HTMLElementType> {
    const debugElement = this.fixture.debugElement.query(By.css(cssSelector));

    if (assert && !debugElement) {
      throw new Error(`Element with selector "${cssSelector}" was not found.`);
    }

    return debugElement;
  }

  getDebugElementByTestId<HTMLElementType extends HTMLElement = HTMLElement>(
    testId: string,
    assert = true,
  ): DebugHtmlElement<HTMLElementType> {
    return this.getDebugElementByCss(this.getSelectorByTestId(testId), assert);
  }

  getDebugElementByDirective<HTMLElementType extends HTMLElement = HTMLElement>(
    directive: Type<unknown>,
    assert = true,
  ): DebugHtmlElement<HTMLElementType> {
    const debugElement = this.fixture.debugElement.query(By.directive(directive));

    if (assert && !debugElement) {
      throw new Error(`Element with directive "${directive.name}" was not found.`);
    }

    return debugElement;
  }

  getAllDebugElementsByCss<HTMLElementType extends HTMLElement = HTMLElement>(cssSelector: string): DebugHtmlElement<HTMLElementType>[] {
    return this.fixture.debugElement.queryAll(By.css(cssSelector));
  }

  getAllDebugElementsByTestId<HTMLElementType extends HTMLElement = HTMLElement>(testId: string): DebugHtmlElement<HTMLElementType>[] {
    return this.getAllDebugElementsByCss(this.getSelectorByTestId(testId));
  }

  getAllDebugElementsByDirective<HTMLElementType extends HTMLElement = HTMLElement>(
    directive: Type<unknown>,
  ): DebugHtmlElement<HTMLElementType>[] {
    return this.fixture.debugElement.queryAll(By.directive(directive));
  }

  query<T extends HTMLElement>(cssSelector: string, assert = true): T {
    const element: T = this.fixture.nativeElement.querySelector(cssSelector);

    if (assert && !element) {
      throw new Error(`Element with selector "${cssSelector}" was not found.`);
    }

    return element;
  }

  queryAll<T extends HTMLElement>(selector: string): T[] {
    return this.fixture.nativeElement.querySelectorAll(selector);
  }

  removeNativeElement(): void {
    this.fixture.debugElement.nativeElement.remove();
  }
}
