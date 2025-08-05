import { Component, viewChild, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { FormGroup } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { PageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModelForm } from '@keira/shared/utils';
import { SpellDbc } from '@keira/shared/acore-world-model';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { SpellHandlerService } from '../../spell-handler.service';

import { SpellDbcService } from '../spell-dbc.service';
import { SpellDbcFlagsComponent } from './spell-dbc-flags.component';

describe('SpellDbcFlagsComponent', () => {
  class SpellDbcFlagsComponentPage extends PageObject<TestHostComponent> {}

  @Component({
    template: '<keira-spell-dbc-flags [formGroup]="form" />',
    imports: [RouterTestingModule, TranslateTestingModule, SpellDbcFlagsComponent],
  })
  class TestHostComponent {
    readonly child = viewChild.required(SpellDbcFlagsComponent);
    form!: FormGroup<ModelForm<SpellDbc>>;
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
        SpellDbcFlagsComponent,
      ],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations(), SpellHandlerService],
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

  it('should correctly display the values of the form', async () => {
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
});
