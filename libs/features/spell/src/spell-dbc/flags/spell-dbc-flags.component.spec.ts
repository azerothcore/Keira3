import { Component, provideZonelessChangeDetection, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { SpellDbc } from '@keira/shared/acore-world-model';
import { FlagsSelectorBtnComponent } from '@keira/shared/selectors';
import { PageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModelForm } from '@keira/shared/utils';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { TooltipDirective } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { SpellHandlerService } from '../../spell-handler.service';

import { SpellDbcService } from '../spell-dbc.service';
import { SpellDbcFlagsComponent } from './spell-dbc-flags.component';

describe('SpellDbcFlagsComponent', () => {
  class SpellDbcFlagsComponentPage extends PageObject<TestHostComponent> {}

  @Component({
    template: '<keira-spell-dbc-flags [formGroup]="form" />',
    imports: [TranslateTestingModule, SpellDbcFlagsComponent],
  })
  class TestHostComponent {
    readonly child = viewChild.required(SpellDbcFlagsComponent);
    form!: FormGroup<ModelForm<SpellDbc>>;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ModalDirective,
        ToastrModule.forRoot(),
        TooltipDirective,
        TranslateTestingModule,
        TestHostComponent,
        SpellDbcFlagsComponent,
      ],
      providers: [provideRouter([]), provideZonelessChangeDetection(), provideNoopAnimations(), SpellHandlerService],
    }).compileComponents();
  });

  const fields: string[] = [
    'InterruptFlags',
    'AuraInterruptFlags',
    'ChannelInterruptFlags',
    'Attributes',
    'AttributesEx',
    'AttributesEx2',
    'AttributesEx3',
    'AttributesEx4',
    'AttributesEx5',
    'AttributesEx6',
    'AttributesEx7',
    'TargetCreatureType',
    'ShapeshiftMask',
    'ShapeshiftExclude',
    'FacingCasterFlags',
  ];
  const createMockVal = (field: string): number => field.length;

  const setup = () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    const host = fixture.componentInstance;
    const page = new SpellDbcFlagsComponentPage(fixture);
    const form = TestBed.inject(SpellDbcService).form;
    host.form = form;

    fixture.detectChanges();
    const component = host.child();

    return { fixture, component, page, form };
  };

  it('should correctly display all fields', () => {
    const { page } = setup();

    for (const field of fields) {
      page.expectInputVisible(field);
    }
  });

  it('should correctly display the values of the form', () => {
    const { page, form } = setup();

    for (const field of fields) {
      form.get(field)?.setValue(createMockVal(field));
    }
    page.detectChanges();

    for (const field of fields) {
      expect(page.getInput(field).value).toEqual(String(createMockVal(field)));
    }
  });

  it('should correctly edit the values of the form', () => {
    const { page, form } = setup();
    page.detectChanges();

    for (const field of fields) {
      page.setInputValue(page.getInput(field), createMockVal(field));
    }
    page.detectChanges();

    for (const field of fields) {
      expect(form.get(field)?.value).toEqual(createMockVal(field));
    }
  });

  it('should correctly configure flags selectors including ShapeshiftExclude', () => {
    const { fixture, form } = setup();

    const flagSelectors = fixture.debugElement.queryAll(By.directive(FlagsSelectorBtnComponent));
    const shapeshiftExcludeSelector = flagSelectors.find(
      (s) => (s.componentInstance.config()?.name ?? s.componentInstance.config?.name) === 'ShapeshiftExclude',
    );
    expect(shapeshiftExcludeSelector).toBeTruthy();
    expect(shapeshiftExcludeSelector?.componentInstance.control).toBe(form.controls.ShapeshiftExclude);
  });
});
