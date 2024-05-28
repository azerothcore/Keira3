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

class GenericOptionSelectorComponentPage extends PageObject<TestHostComponent> {}

describe('GenericOptionSelectorComponent', () => {
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

  it('change select values', () => {
    const { page, host } = setup();
    const select = page.getDebugElementByCss('select');

    host.mockFormControl.setValue(1);
    page.detectChanges();

    expect(select.nativeElement.value).toEqual('1: 1');
    console.log('select.nativeElement.selectedOptions', select.nativeElement.selectedOptions);
    expect(select.nativeElement.selectedOptions[0].label).toEqual('1 - The Burning Crusade');

    host.mockFormControl.setValue(0);
    page.detectChanges();

    expect(select.nativeElement.value).toEqual('0: 0');
    expect(select.nativeElement.selectedOptions[0].label).toEqual('0 - Classic');
  });
});
