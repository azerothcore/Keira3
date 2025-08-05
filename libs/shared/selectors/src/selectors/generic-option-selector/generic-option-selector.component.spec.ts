import { Component, viewChild, provideZonelessChangeDetection } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { FormControl } from '@angular/forms';
import { EXPANSION } from '@keira/shared/acore-world-model';
import { PageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { GenericOptionSelectorComponent } from './generic-option-selector.component';

@Component({
  template: `<keira-generic-option-selector [control]="mockFormControl" [optionList]="EXPANSION" />`,
  imports: [GenericOptionSelectorComponent],
})
class TestHostComponent {
  readonly child = viewChild.required(GenericOptionSelectorComponent);
  mockFormControl = new FormControl();
  EXPANSION = EXPANSION;
}

describe('GenericOptionSelectorComponent', () => {
  class GenericOptionSelectorComponentPage extends PageObject<TestHostComponent> {}

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [GenericOptionSelectorComponent, TestHostComponent, TranslateTestingModule],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations()],
    }).compileComponents();
  }));

  const setup = () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    const host = fixture.componentInstance;
    const component = host.child();
    const page = new GenericOptionSelectorComponentPage(fixture);

    fixture.detectChanges();

    return { fixture, host, component, page };
  };

  it('changing the form value via input will be reflected in the template', () => {
    const { page, host } = setup();
    const select = page.getDebugElementByCss<HTMLSelectElement>('select').nativeElement;

    host.mockFormControl.setValue(1);
    page.detectChanges();

    expect(select.value).toEqual('1: 1');
    expect(select.selectedOptions[0].label).toEqual('1 - The Burning Crusade');

    host.mockFormControl.setValue(0);
    page.detectChanges();

    expect(select.value).toEqual('0: 0');
    expect(select.selectedOptions[0].label).toEqual('0 - Classic');
  });

  it('changing the input valuewill be reflected in the form control', () => {
    const { page, host } = setup();
    const select = page.getDebugElementByCss<HTMLSelectElement>('select').nativeElement;

    page.setInputValue(select, '1: 1');

    expect(host.mockFormControl.value).toEqual(1);
    expect(select.selectedOptions[0].label).toEqual('1 - The Burning Crusade');

    page.setInputValue(select, '0: 0');

    expect(host.mockFormControl.value).toEqual(0);
    expect(select.selectedOptions[0].label).toEqual('0 - Classic');
  });
});
