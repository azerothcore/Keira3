import { Component, ViewChild } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { EXPANSION } from '@keira/shared/acore-world-model';
import { PageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { GenericOptionSelectorComponent } from './generic-option-selector.component';

@Component({
  template: `<keira-generic-option-selector [control]="mockFormControl" [optionList]="EXPANSION"></keira-generic-option-selector>`,
  standalone: true,
  imports: [GenericOptionSelectorComponent],
})
class TestHostComponent {
  @ViewChild(GenericOptionSelectorComponent) child!: GenericOptionSelectorComponent;
  mockFormControl = new FormControl();
  EXPANSION = EXPANSION;
}

describe('GenericOptionSelectorComponent', () => {
  class GenericOptionSelectorComponentPage extends PageObject<TestHostComponent> {}

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [GenericOptionSelectorComponent, TestHostComponent, TranslateTestingModule],
    }).compileComponents();
  }));

  const setup = () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    const host = fixture.componentInstance;
    const component = host.child;
    const page = new GenericOptionSelectorComponentPage(fixture);

    fixture.detectChanges();

    return { fixture, host, component, page };
  };

  it('changing the form value via input will be reflected in the template', () => {
    const { page, host } = setup();
    const select = page.getDebugElementByCss('select').nativeElement;

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
    const select = page.getDebugElementByCss('select').nativeElement;

    select.value = '1: 1';
    select.dispatchEvent(new Event('change'));
    page.detectChanges();

    expect(host.mockFormControl.value).toEqual(1);
    expect(select.selectedOptions[0].label).toEqual('1 - The Burning Crusade');

    select.value = '0: 0';
    select.dispatchEvent(new Event('change'));
    page.detectChanges();

    expect(host.mockFormControl.value).toEqual(0);
    expect(select.selectedOptions[0].label).toEqual('0 - Classic');
  });
});
