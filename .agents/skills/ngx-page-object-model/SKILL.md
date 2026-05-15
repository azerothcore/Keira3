---
name: ngx-page-object-model
description: Use this skill whenever working with Angular Component tests.
license: MIT
metadata:
  author: Francesco Borzì
  version: '1.0'
---

# ngx-page-object-model — Angular component testing

This project uses the `ngx-page-object-model` library. **Every Angular component unit test must follow the Page Object Model (POM) pattern described here.** The library ships its own documentation, which you should consult on demand — see the routing table below.

## The core principle

A component's public API is its **template + inputs + outputs**. Methods, properties, signals, computed values, and internal state are implementation detail. A test drives the component the way a real user would: through the DOM. You assert on what the user would see, not on what the class holds.

This is the same reasoning behind testing a service through its public methods, not its private ones. Tests that couple to internals break on harmless refactors and silently miss real bugs in the template — because the template was never exercised.

## Forbidden patterns

The following are unconditional rules, regardless of access modifier (`private`, `protected`, or `public`):

- **Never** call a method on the component instance:
  - `component.someMethod()`
  - `page.fixture.componentInstance.someMethod()`
  - `page.component.someMethod()`
- **Never** read or write a property on the component instance:
  - `component.someSignal()`
  - `component.formGroup`
  - `page.fixture.componentInstance.someProp = 'x'`
- **Never** use type casts to bypass access modifiers:
  - `(component as any).someMethod()`
  - `(page.fixture.componentInstance as any)['someProperty']`
  - `(page.component as any).whatever`

If you find yourself reaching for `as any` to access a component member, **stop**. That cast is the signal that you are about to bypass the public API. The right move is to step back and ask: *what DOM interaction would a real user perform to trigger this code path, and what rendered output would they see as a result?* There is essentially always a way through the template — and for the one case where there isn't (extracting a `FormControl` bound via `[formControl]`), the library provides a dedicated DOM-based extractor; see "Working with forms" below.

Why so absolute? Because every shortcut here is a test that doesn't test the template. Setting a public modifier "just for testing" is even worse — it advertises that the contract can be reached around, and the next developer will do exactly that.

## Canonical test structure

Every component test in this project should look roughly like this:

```typescript
import { TestBed } from '@angular/core/testing';
import { DebugHtmlElement, PageObjectModel } from 'ngx-page-object-model';
import { MyComponent } from './my.component';

describe(MyComponent.name, () => {
  class Page extends PageObjectModel<MyComponent> {
    // element-access methods — one per DOM element the tests need
    submitButton(): DebugHtmlElement<HTMLButtonElement> {
      return this.getDebugElementByTestId('submit-button');
    }
    statusText(): DebugHtmlElement<HTMLSpanElement> {
      return this.getDebugElementByTestId('status-text');
    }

    // action methods — what a user would do
    clickSubmit(): void {
      this.submitButton().nativeElement.click();
    }
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComponent],
    }).compileComponents();
  });

  // setup() returns everything tests need; nothing mutable is shared at module scope
  const setup = (config: { initialName?: string } = {}) => {
    const page = new Page(TestBed.createComponent(MyComponent));
    page.fixture.componentRef.setInput('name', config.initialName ?? 'world');
    return { page };
  };

  it('greets the user when submit is clicked', async () => {
    const { page } = setup();
    page.clickSubmit();
    await page.fixture.whenStable();

    expect(page.statusText().nativeElement.textContent).toContain('Hello, world');
  });
});
```

Five non-obvious things this template encodes:

1. **`Page` is a class**, not a bag of helpers. Element-access methods return `DebugHtmlElement<HTMLSomething>` so call sites get type-safe `nativeElement`.
2. **Use `getDebugElementByTestId`** as the default lookup. CSS selectors are a fallback. The library throws descriptive errors (`Element with selector "..." was not found.`) instead of returning null — no null-checking required.
3. **`setup()` is a function, not `beforeEach`.** Only TestBed configuration goes in `beforeEach`; all mutable per-test state is created in `setup()` and returned. This prevents order-dependent flakiness from accidentally leaked state.
4. **Inputs go through `componentRef.setInput()`**, never by writing to a class property.
5. **Assertions are on the DOM** (text content, attribute presence, element existence), never on signals or component properties.

## When to read which doc

The full library documentation ships inside the package. **Read only the doc(s) relevant to the current task** — don't pre-load all of them.

**Base path:** `node_modules/ngx-page-object-model/docs/`
(If you're working inside this library's own repo, the same files live at `website/docs/`.)

| If the task involves… | Read |
|---|---|
| Forms — `FormControl`, `FormGroup`, `[formControl]`, `[formControlName]` | `advanced/testing-form-controls.md` — **required reading whenever forms are involved** |
| Asserting an element is *not* present (e.g. `@if`-gated content) | `getting-started/testing-absent-elements.md` |
| Looking up a specific Page Object method signature | `reference/page-object-methods.md` |
| Building a custom base Page Object class, or the project uses a non-default test-id attribute (`data-test`, `data-cy`, etc.) | `advanced/making-customizations.md` |
| The project also uses `@ngneat/spectator` and the test needs to combine them | `advanced/using-with-spectator.md` |
| Choosing test selectors / replacing brittle CSS selectors | `best-practices/data-testid.md` |
| Refactoring `beforeEach` or shared mutable variables between tests | `best-practices/avoid-shared-variables.md` |
| The user pushes back on `protected`/`private` accessors or asks "why can't I just call the method?" | `best-practices/encapsulation.md` |
| The user is new to the library and asks what it is or how POM works conceptually | `getting-started/introduction.md` |
| First-time install / library not yet in `package.json` | `getting-started/setup.md` — usually skip; if this skill is active, the library is installed |

When in doubt, start with `reference/page-object-methods.md` — it's the fastest lookup — and branch out from there.

## Working with forms (the most common pitfall)

When a test needs a `FormControl` or `FormGroup` that lives inside the component, the temptation is to write `(component as any).formGroup`. Don't. The library provides DOM-based extractors specifically for this:

```typescript
import { getFormControlOfDebugElement, getFormGroupOfDebugElement } from 'ngx-page-object-model';

const input = page.someInputElement();                // a DebugHtmlElement
const control = getFormControlOfDebugElement(input);  // the FormControl bound to [formControl]

const formEl = page.myForm();                         // a DebugHtmlElement<HTMLFormElement>
const group = getFormGroupOfDebugElement(formEl);     // the FormGroup bound to [formGroup]
```

This extracts the control *through the DOM*, which means the test simultaneously verifies that the binding works. Reaching into the class would only verify that the constructor ran. For typed variants and the `getFormGroupOfDebugElement<{ field: FormControl<string> }>(...)` form, read `advanced/testing-form-controls.md`.

## Other utilities the library exports

- **`typeInElement(element, value)`** — simulates user typing by setting `.value` and dispatching an `input` event. Use this instead of assigning to `element.value` directly; the latter doesn't notify Angular's form machinery.
- **`tickAsync()`** — Promise-based replacement for `fakeAsync`'s `tick()`, intended for zoneless apps. Use in `async` tests where you'd otherwise reach for `fakeAsync`.

## Element-absence and optional `assert`

Library lookup methods (`getDebugElementByTestId`, `getDebugElementByCss`, `getDebugElementByDirective`) accept an optional `assert` parameter that defaults to `true` — meaning they throw a descriptive error if the element is missing. When writing a Page Object method for an element that may legitimately be absent, **forward `assert` through, don't hardcode `false`**:

```typescript
// Good — assertion still fires by default; tests opt out when they expect absence.
optionalBanner(assert = true): DebugHtmlElement<HTMLDivElement> {
  return this.getDebugElementByTestId('banner', assert);
}

// Then in the one test that expects it to be missing:
expect(page.optionalBanner(false)).toBeFalsy();
```

Hardcoding `assert = false` permanently disables the descriptive error for every caller and turns a clear "element not found" message into a vague "cannot read properties of undefined" downstream. See `getting-started/testing-absent-elements.md` for the full pattern.

## When you slip up

If you're mid-test and notice yourself typing `(component as any)` or `componentInstance.something`, the skill has failed to land. Re-read "Forbidden patterns" and ask the user-action question: *what would a real user click, type, or see to make this happen?* If the genuine answer is "there is no user-visible interaction" — e.g. you're testing a `ControlValueAccessor` and need the bound `FormControl` — that's precisely what `getFormControlOfDebugElement` is for. There is essentially always a way through the public API; reaching past it is almost always a sign the test is about to lie.
