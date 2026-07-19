import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { SingleValueSelectorModalComponent } from './single-value-selector-modal.component';

describe('SingleValueSelectorModalComponent', () => {
  const value = 'myValue';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SingleValueSelectorModalComponent, TranslateTestingModule],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations(), BsModalRef],
    }).compileComponents();
  });

  function setup() {
    const fixture = TestBed.createComponent(SingleValueSelectorModalComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    return { fixture, component };
  }

  it('should safely create without config', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  it('should properly handle config (if any)', () => {
    const { component } = setup();
    component.value = value;
    component.config = {
      name: 'Mock Modal Name',
      options: [
        { name: 'option1', value: 'some value' },
        { name: 'option2', value },
        { name: 'option3', value: 'some other value' },
      ],
    };

    component.ngOnInit();

    expect(component.selected).toEqual([{ name: 'option2', value }]);
  });

  it('onSelect() should properly set the value', () => {
    const { component } = setup();
    component.onSelect({ selected: [{ value }] });
    expect(component.value).toEqual(value);
  });
});
