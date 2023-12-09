import { Component, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateTestingModule } from '@keira-shared/testing/translate-module';
import { ModelForm } from '@keira-shared/utils/helpers';
import { PageObject } from '@keira-testing/page-object';
import { SpellDbc } from '@keira-types/spell-dbc.type';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { SpellHandlerService } from '../../../spell-handler.service';
import { SpellDbcModule } from '../../spell-dbc.module';
import { SpellDbcService } from '../../spell-dbc.service';
import { SpellDbcSpellEffectComponent } from './spell-dbc-spell-effect.component';
import { SpellDbcSpellEffectFieldPrefix, SPELL_DBC_SPELL_EFFECT_FIELDS } from './spell-dbc-spell-effect.model';

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
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default, // TODO: migrate to OnPush: https://github.com/azerothcore/Keira3/issues/2602
    template: '<keira-spell-dbc-spell-effect [formGroup]="form" [index]="index"></keira-spell-dbc-spell-effect>',
  })
  class TestHostComponent {
    @ViewChild(SpellDbcSpellEffectComponent) child: SpellDbcSpellEffectComponent;
    form: FormGroup<ModelForm<SpellDbc>>;
    index: number;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestHostComponent, SpellDbcSpellEffectComponent],
      imports: [
        ModalModule.forRoot(),
        ToastrModule.forRoot(),
        TooltipModule.forRoot(),
        SpellDbcModule,
        RouterTestingModule,
        TranslateTestingModule,
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
