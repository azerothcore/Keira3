import { Component, ViewChild } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { PageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { BooleanOptionSelectorComponent } from './boolean-option-selector.component';

@Component({
  template: `<keira-boolean-option-selector [control]="mockFormControl" controlName="mockFormControl"></keira-boolean-option-selector>`,
  standalone: true,
  imports: [BooleanOptionSelectorComponent],
})
class TestHostComponent {
  @ViewChild(BooleanOptionSelectorComponent) child!: BooleanOptionSelectorComponent;
  mockFormControl = new FormControl();
}

describe('BooleanOptionSelectorComponent', () => {
  class BooleanOptionSelectorComponentPage extends PageObject<TestHostComponent> {}

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [BooleanOptionSelectorComponent, TestHostComponent, TranslateTestingModule],
    }).compileComponents();
  }));

  const setup = () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    const host = fixture.componentInstance;
    const component = host.child;
    const page = new BooleanOptionSelectorComponentPage(fixture);

    fixture.detectChanges();

    return { fixture, host, component, page };
  };

  it('changing the form value via input will be reflected in the template', () => {
    const { page, host } = setup();
    const select = page.getDebugElementByCss('select').nativeElement;

    host.mockFormControl.setValue(1);
    page.detectChanges();

    expect(select.value).toEqual('1: 1');
    expect(select.selectedOptions[0].innerText).toEqual('1 - SELECTORS.ENABLED');

    host.mockFormControl.setValue(0);
    page.detectChanges();

    expect(select.value).toEqual('0: 0');
    expect(select.selectedOptions[0].innerText).toEqual('0 - SELECTORS.DISABLED');
  });

  it('changing the input valuewill be reflected in the form control', () => {
    const { page, host } = setup();
    const select = page.getDebugElementByCss('select').nativeElement;

    select.value = '1: 1';
    select.dispatchEvent(new Event('change'));
    page.detectChanges();

    expect(host.mockFormControl.value).toEqual(1);
    expect(select.selectedOptions[0].innerText).toEqual('1 - SELECTORS.ENABLED');

    select.value = '0: 0';
    select.dispatchEvent(new Event('change'));
    page.detectChanges();

    expect(host.mockFormControl.value).toEqual(0);
    expect(select.selectedOptions[0].innerText).toEqual('0 - SELECTORS.DISABLED');
  });
});
