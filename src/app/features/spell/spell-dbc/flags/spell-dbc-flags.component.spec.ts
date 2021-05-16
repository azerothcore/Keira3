import { TestBed } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';

import { SpellDbcFlagsComponent } from './spell-dbc-flags.component';
import { SpellDbcModule } from '../spell-dbc.module';
import { PageObject } from '@keira-testing/page-object';
import { SpellDbcService } from '../spell-dbc.service';
import { SpellHandlerService } from '../../spell-handler.service';
import { FormGroup } from 'ngx-typesafe-forms';
import { SpellDbc } from '@keira-types/spell-dbc.type';

describe('SpellDbcFlagsComponent', () => {
  class SpellDbcFlagsComponentPage extends PageObject<TestHostComponent> {}

  @Component({
    template: '<keira-spell-dbc-flags [formGroup]="form"></keira-spell-dbc-flags>',
  })
  class TestHostComponent {
    @ViewChild(SpellDbcFlagsComponent) child: SpellDbcFlagsComponent;
    form: FormGroup<SpellDbc>;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestHostComponent, SpellDbcFlagsComponent],
      imports: [SpellDbcModule, RouterTestingModule],
      providers: [SpellHandlerService],
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
  ];
  const createMockVal = (field: string): number => field.length;

  const setup = () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    const host = fixture.componentInstance;
    const page = new SpellDbcFlagsComponentPage(fixture);
    const form = TestBed.inject(SpellDbcService).form;
    host.form = form;

    fixture.detectChanges();
    const component = host.child;

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
      form.getControl(field).setValue(createMockVal(field));
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
      expect(form.getControl(field).value).toEqual(createMockVal(field));
    }
  });
});
