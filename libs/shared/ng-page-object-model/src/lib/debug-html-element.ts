import { DebugElement } from '@angular/core';

export type DebugHtmlElement<HTMLElementType extends HTMLElement = HTMLElement> = Omit<DebugElement, 'nativeElement'> & {
  nativeElement: HTMLElementType;
};
