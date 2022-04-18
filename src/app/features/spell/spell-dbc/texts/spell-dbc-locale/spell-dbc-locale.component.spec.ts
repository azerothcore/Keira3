import { Component, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { PageObject } from '@keira-testing/page-object';
import { SpellDbc } from '@keira-types/spell-dbc.type';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { FormGroup } from 'ngx-typesafe-forms';
import { SpellHandlerService } from '../../../spell-handler.service';
import { SpellDbcModule } from '../../spell-dbc.module';
import { SpellDbcService } from '../../spell-dbc.service';
import { Locale, SpellDbcTextFieldPrefix, SPELL_DBC_TEXT_FIELDS } from '../spell-dbc-texts.model';
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
    template: '<keira-spell-dbc-locale [formGroup]="form" [locale]="locale"></keira-spell-dbc-locale>',
  })
  class TestHostComponent {
    @ViewChild(SpellDbcLocaleComponent) child: SpellDbcLocaleComponent;
    form: FormGroup<SpellDbc>;
    locale: Locale;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestHostComponent, SpellDbcLocaleComponent],
      imports: [ToastrModule.forRoot(), TooltipModule.forRoot(), SpellDbcModule, RouterTestingModule],
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
      form.getControl(`${field}_${testLocale}`).setValue(createMockVal(field));
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
      expect(form.getControl(`${field}_${testLocale}`).value).toEqual(createMockVal(field));
    }
  });
});
