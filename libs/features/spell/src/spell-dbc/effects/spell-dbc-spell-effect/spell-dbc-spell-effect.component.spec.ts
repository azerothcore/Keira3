import { Component, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { PageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModelForm } from '@keira/shared/utils';
import { SpellDbc } from '@keira/shared/acore-world-model';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { SpellHandlerService } from '../../../spell-handler.service';
import { SpellDbcService } from '../../spell-dbc.service';
import { SpellDbcSpellEffectComponent } from './spell-dbc-spell-effect.component';
import { SPELL_DBC_SPELL_EFFECT_FIELDS, SpellDbcSpellEffectFieldPrefix } from './spell-dbc-spell-effect.model';

describe('SpellDbcSpellEffectComponent', () => {
  class SpellDbcSpellEffectComponentPage extends PageObject<TestHostComponent> {
    getLabelByIndex(fieldName: string, index: number): HTMLLabelElement {
      return this.query<HTMLLabelElement>(`.control-label[for="${fieldName}_${index}"]`);
    }
    getInputByIndex(fieldName: string, index: number): HTMLInputElement {
      return this.query<HTMLInputElement>(`input.form-control[id="${fieldName}_${index}"]`);
    }
    expectInputVisibleByIndex(fieldName: string, index: number): void {
      expect(this.getLabelByIndex(fieldName, index)).toBeDefined();
      expect(this.getInputByIndex(fieldName, index)).toBeDefined();
    }
  }

  @Component({
    template: '<keira-spell-dbc-spell-effect [formGroup]="form" [index]="index"></keira-spell-dbc-spell-effect>',
    standalone: true,
    imports: [RouterTestingModule, TranslateTestingModule, SpellDbcSpellEffectComponent],
  })
  class TestHostComponent {
    @ViewChild(SpellDbcSpellEffectComponent) child: SpellDbcSpellEffectComponent;
    form: FormGroup<ModelForm<SpellDbc>>;
    index: number;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ModalModule.forRoot(),
        ToastrModule.forRoot(),
        TooltipModule.forRoot(),
        RouterTestingModule,
        TranslateTestingModule,
        TestHostComponent,
        SpellDbcSpellEffectComponent,
      ],
      providers: [SpellHandlerService],
    }).compileComponents();
  });

  const setup = () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    const host = fixture.componentInstance;
    const form = TestBed.inject(SpellDbcService).form;
    const page = new SpellDbcSpellEffectComponentPage(fixture);
    host.form = form;

    fixture.detectChanges();
    const component = host.child;

    return { fixture, component, page, host, form };
  };

  const testIndex = 3;
  const createMockVal = (field: SpellDbcSpellEffectFieldPrefix): number => field.length;

  it('should correctly display the inputs and their labels', async () => {
    const { host, page } = setup();
    host.index = testIndex;

    page.detectChanges();
    await page.whenStable();

    for (const field of SPELL_DBC_SPELL_EFFECT_FIELDS) {
      page.expectInputVisibleByIndex(field, testIndex);
    }
  });

  it('should correctly display the values of the form', async () => {
    const { host, page, form } = setup();
    host.index = testIndex;

    for (const field of SPELL_DBC_SPELL_EFFECT_FIELDS) {
      form.get(`${field}_${testIndex}`).setValue(createMockVal(field));
    }
    page.detectChanges();
    await page.whenStable();

    for (const field of SPELL_DBC_SPELL_EFFECT_FIELDS) {
      expect(page.getInputByIndex(field, testIndex).value).toEqual(String(createMockVal(field)));
    }
  });

  it('should correctly edit the values of the form', async () => {
    const { host, page, form } = setup();
    host.index = testIndex;
    page.detectChanges();

    for (const field of SPELL_DBC_SPELL_EFFECT_FIELDS) {
      page.setInputValue(page.getInputByIndex(field, testIndex), createMockVal(field));
    }
    page.detectChanges();
    await page.whenStable();

    for (const field of SPELL_DBC_SPELL_EFFECT_FIELDS) {
      expect(form.get(`${field}_${testIndex}`).value).toEqual(createMockVal(field));
    }
  });
});
