import { Component, provideZonelessChangeDetection, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
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

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GenericOptionIconSelectorComponent, TestHostComponent, TranslateTestingModule],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations()],
    }).compileComponents();
  });

  const setup = () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    const host = fixture.componentInstance;
    const component = host.child();
    const page = new GenericOptionIconSelectorComponentPage(fixture);

    fixture.detectChanges();

    return { fixture, host, component, page };
  };

  it('should display all options from optionList', async () => {
    const { page, component } = setup();

    page.detectChanges();

    expect(component.optionList()).toEqual(OPTION_ICON);
  });
});
