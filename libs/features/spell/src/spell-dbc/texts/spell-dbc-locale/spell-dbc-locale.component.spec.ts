import { Component, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { PageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModelForm } from '@keira/shared/utils';
import { SpellDbc } from '@keira/shared/acore-world-model';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { SpellHandlerService } from '../../../spell-handler.service';
import { SpellDbcService } from '../../spell-dbc.service';
import { Locale, SPELL_DBC_TEXT_FIELDS, SpellDbcTextFieldPrefix } from '../spell-dbc-texts.model';
import { SpellDbcLocaleComponent } from './spell-dbc-locale.component';

describe('SpellDbcLocaleComponent', () => {
  class SpellDbcLocaleComponentPage extends PageObject<TestHostComponent> {
    getLabelByLocale(fieldName: string, locale: Locale): HTMLLabelElement {
      return this.query<HTMLLabelElement>(`.control-label[for="${fieldName}_${locale}"]`);
    }
    getInputByLocale(fieldName: string, locale: Locale): HTMLTextAreaElement {
      return this.query<HTMLTextAreaElement>(`textarea.form-control[id="${fieldName}_${locale}"]`);
    }
    expectInputVisibleByLocale(fieldName: string, locale: Locale): void {
      expect(this.getLabelByLocale(fieldName, locale)).toBeDefined();
    }
  }

  @Component({
    template: '<keira-spell-dbc-locale [formGroup]="form" [locale]="locale" />',
    standalone: true,
    imports: [RouterTestingModule, TranslateTestingModule, SpellDbcLocaleComponent],
  })
  class TestHostComponent {
    @ViewChild(SpellDbcLocaleComponent) child!: SpellDbcLocaleComponent;
    form!: FormGroup<ModelForm<SpellDbc>>;
    locale!: Locale;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ToastrModule.forRoot(),
        TooltipModule.forRoot(),
        RouterTestingModule,
        TranslateTestingModule,
        TestHostComponent,
        SpellDbcLocaleComponent,
      ],
      providers: [SpellHandlerService],
    }).compileComponents();
  });

  const setup = () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    const host = fixture.componentInstance;
    const form = TestBed.inject(SpellDbcService).form;
    const page = new SpellDbcLocaleComponentPage(fixture);
    host.form = form;

    fixture.detectChanges();
    const component = host.child;

    return { fixture, component, page, host, form };
  };

  const testLocale: Locale = 'esES';
  const createMockVal = (field: SpellDbcTextFieldPrefix) => `mock-${field}-${testLocale}`;

  it('should correctly display the inputs and their labels', () => {
    const { host, page } = setup();
    host.locale = testLocale;

    page.detectChanges();

    for (const field of SPELL_DBC_TEXT_FIELDS) {
      page.expectInputVisibleByLocale(field, testLocale);
    }
  });

  it('should correctly display the values of the form', () => {
    const { host, page, form } = setup();
    host.locale = testLocale;

    for (const field of SPELL_DBC_TEXT_FIELDS) {
      form.get(`${field}_${testLocale}`)?.setValue(createMockVal(field));
    }
    page.detectChanges();

    for (const field of SPELL_DBC_TEXT_FIELDS) {
      expect(page.getInputByLocale(field, testLocale).value).toEqual(createMockVal(field));
    }
  });

  it('should correctly edit the values of the form', () => {
    const { host, page, form } = setup();
    host.locale = testLocale;
    page.detectChanges();

    for (const field of SPELL_DBC_TEXT_FIELDS) {
      page.setInputValue(page.getInputByLocale(field, testLocale), createMockVal(field));
    }
    page.detectChanges();

    for (const field of SPELL_DBC_TEXT_FIELDS) {
      expect(form.get(`${field}_${testLocale}`)?.value).toEqual(createMockVal(field));
    }
  });
});
