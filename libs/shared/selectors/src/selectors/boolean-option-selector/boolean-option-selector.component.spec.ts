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

class BooleanOptionSelectorComponentPage extends PageObject<TestHostComponent> {}

describe('BooleanOptionSelectorComponent', () => {
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

  it('change select values', () => {
    const { page, host } = setup();
    const select = page.getDebugElementByCss('select');

    host.mockFormControl.setValue(1);
    page.detectChanges();

    expect(select.nativeElement.value).toEqual('1: 1');
    expect(select.nativeElement.selectedOptions[0].innerText).toEqual('1 - SELECTORS.ENABLED');

    host.mockFormControl.setValue(0);
    page.detectChanges();

    expect(select.nativeElement.value).toEqual('0: 0');
    expect(select.nativeElement.selectedOptions[0].innerText).toEqual('0 - SELECTORS.DISABLED');
  });
});
