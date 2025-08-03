import { Component, viewChild } from '@angular/core';
import { fakeAsync, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { OPTION_ICON } from '@keira/shared/acore-world-model';
import { PageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { GenericOptionIconSelectorComponent } from './generic-option-icon-selector.component';

@Component({
  template: `<keira-generic-option-icon-selector [control]="mockFormControl" [optionList]="OPTION_ICON" />`,
  imports: [GenericOptionIconSelectorComponent],
})
class TestHostComponent {
  readonly child = viewChild.required(GenericOptionIconSelectorComponent);
  mockFormControl = new FormControl();
  OPTION_ICON = OPTION_ICON;
}

describe('GenericOptionIconSelectorComponent', () => {
  class GenericOptionIconSelectorComponentPage extends PageObject<TestHostComponent> {}

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [GenericOptionIconSelectorComponent, TestHostComponent, TranslateTestingModule],
    }).compileComponents();
  }));

  const setup = () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    const host = fixture.componentInstance;
    const component = host.child();
    const page = new GenericOptionIconSelectorComponentPage(fixture);

    fixture.detectChanges();

    return { fixture, host, component, page };
  };

  it('should display all options from optionList', fakeAsync(() => {
    const { page, component } = setup();

    page.detectChanges();

    expect(component.optionList()).toEqual(OPTION_ICON);
  }));
});
