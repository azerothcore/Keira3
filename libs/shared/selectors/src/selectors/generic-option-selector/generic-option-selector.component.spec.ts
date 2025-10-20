import { Component, provideZonelessChangeDetection, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { EXPANSION, OPTION_ICON } from '@keira/shared/acore-world-model';
import { PageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { GenericOptionSelectorComponent } from './generic-option-selector.component';

@Component({
  template: `<keira-generic-option-selector [control]="mockFormControl" [optionList]="OPTION_LIST" />`,
  imports: [GenericOptionSelectorComponent],
})
class TestHostComponent {
  readonly child = viewChild.required(GenericOptionSelectorComponent);
  mockFormControl = new FormControl();
  OPTION_LIST = EXPANSION;
}

describe('GenericOptionSelectorComponent', () => {
  class GenericOptionSelectorComponentPage extends PageObject<TestHostComponent> {}

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GenericOptionSelectorComponent, TestHostComponent, TranslateTestingModule],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations()],
    }).compileComponents();
  });

  const setup = (optionList = EXPANSION) => {
    const fixture = TestBed.createComponent(TestHostComponent);
    const host = fixture.componentInstance;
    host.OPTION_LIST = optionList;
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

  it('should display all options from optionList', async () => {
    const { component } = setup(OPTION_ICON);

    expect(component.optionList()).toEqual(OPTION_ICON);
  });
});
