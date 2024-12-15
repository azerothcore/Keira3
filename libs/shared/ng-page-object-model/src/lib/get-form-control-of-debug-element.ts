import { AbstractControl, NgControl } from '@angular/forms';

import { DebugHtmlElement } from './debug-html-element';

export function getFormControlOfDebugElement(debugElement: DebugHtmlElement, assert = true): AbstractControl {
  let ngControl;

  try {
    ngControl = debugElement.injector.get(NgControl);
  } catch {
    if (assert) {
      throw new Error(
        `Unable to find binding [formControl] for element "${debugElement.name}[data-testid=${debugElement.attributes['data-testid']}]"`,
      );
    }
  }

  return ngControl?.control as AbstractControl;
}
