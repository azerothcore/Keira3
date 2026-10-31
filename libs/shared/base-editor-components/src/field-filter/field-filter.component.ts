import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject, signal } from '@angular/core';

/** The class hiding a field the filter leaves out. */
export const FILTERED_OUT = 'keira-filtered-out';

/** The words a field is found by: its label, and its input's id and placeholder. */
export function fieldText(group: Element): string {
  const input = group.querySelector('input, select, textarea');
  return [group.querySelector('label')?.textContent ?? '', input?.id ?? '', input?.getAttribute('placeholder') ?? '']
    .join(' ')
    .toLowerCase();
}

/**
 * A filter of the fields of the editor shown (by their label or column name): the others are hidden while it's typed,
 * so a field of a long editor (creature_template, item_template…) is found at once. Escape clears it.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-field-filter',
  template: `
    <input
      class="keira-field-filter"
      type="search"
      id="field-filter"
      placeholder="Filter fields"
      [value]="text()"
      (input)="setText($any($event.target).value)"
      (keydown.escape)="setText('')"
    />
    @if (text()) {
      <small class="keira-field-filter-count" id="field-filter-count">{{ shown() }}</small>
    }
  `,
  styles: `
    :host {
      position: absolute;
      right: 6px;
      top: 1px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .keira-field-filter {
      width: 150px;
      height: 20px;
      font-size: 12px;
      padding: 0 6px;
      border: 1px solid #555;
      border-radius: 3px;
      background: #1b1b1b;
      color: #eee;
    }
    .keira-field-filter-count {
      color: #aaa;
      font-size: 11px;
    }
  `,
})
export class FieldFilterComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly text = signal('');
  /** How many fields are shown, of how many. */
  protected readonly shown = signal('');
  private observer?: MutationObserver;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.observer?.disconnect());
  }

  protected setText(text: string): void {
    this.text.set(text);
    this.apply();
    // (fields shown later, a row selected or a page loaded, are filtered too)
    if (text && !this.observer) {
      this.observer = new MutationObserver(() => this.apply());
      this.observer.observe(this.editor(), { childList: true, subtree: true });
    } else if (!text) {
      this.observer?.disconnect();
      this.observer = undefined;
    }
  }

  /** The editor page the filter is in. */
  private editor(): HTMLElement {
    return (this.host.nativeElement.closest('keira-top-bar') as HTMLElement).parentElement as HTMLElement;
  }

  private apply(): void {
    const words = this.text().trim().toLowerCase().split(/\s+/).filter(Boolean);
    const groups = [...this.editor().querySelectorAll('form .form-group')];
    let shown = 0;
    for (const group of groups) {
      const text = fieldText(group);
      const match = words.every((word) => text.includes(word));
      group.classList.toggle(FILTERED_OUT, !match);
      shown += match ? 1 : 0;
    }
    this.shown.set(`${shown} / ${groups.length}`);
  }
}
