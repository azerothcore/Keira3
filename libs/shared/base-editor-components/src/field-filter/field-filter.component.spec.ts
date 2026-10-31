import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TopBarComponent } from '../top-bar/top-bar.component';
import { FILTERED_OUT } from './field-filter.component';

@Component({
  template: `
    <keira-top-bar [selected]="'1'" [selectedName]="'Hogger'" [isNew]="false" />
    <form class="edit-form">
      <div class="form-group"><label for="minlevel">minlevel</label><input id="minlevel" /></div>
      <div class="form-group"><label for="maxlevel">maxlevel</label><input id="maxlevel" /></div>
      <div class="form-group">
        <label>Faction</label
        ><select id="faction"></select>
      </div>
      <div class="form-group"><input id="search" placeholder="subname" /></div>
      <div class="form-group"><label>Notes only</label></div>
    </form>
  `,
  imports: [TopBarComponent],
})
class EditorComponent {}

describe('FieldFilterComponent', () => {
  const setup = () => {
    TestBed.configureTestingModule({ imports: [EditorComponent], providers: [provideZonelessChangeDetection()] });
    const fixture = TestBed.createComponent(EditorComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const input = el.querySelector<HTMLInputElement>('#field-filter') as HTMLInputElement;
    const type = (text: string) => {
      input.value = text;
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
    };
    const hidden = () => [...el.querySelectorAll('.form-group')].filter((g) => g.classList.contains(FILTERED_OUT)).length;
    return { fixture, el, input, type, hidden };
  };

  it('hides the fields not matching, by label, id or placeholder', async () => {
    const { el, input, type, hidden, fixture } = setup();
    type('level');
    expect(hidden()).toBe(3);
    expect(el.querySelector('#field-filter-count')?.textContent).toBe('2 / 5');
    type('fact');
    expect(hidden()).toBe(4);
    type('sub');
    expect(hidden()).toBe(4);
    // fields added later are filtered too
    const form = el.querySelector('form') as HTMLFormElement;
    form.insertAdjacentHTML('beforeend', '<div class="form-group"><label>armor</label><input id="armor" /></div>');
    await new Promise((resolve) => setTimeout(resolve));
    expect(hidden()).toBe(5);
    // Escape clears it
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(hidden()).toBe(0);
    expect(el.querySelector('#field-filter-count')).toBeNull();
    fixture.destroy();
  });
});
