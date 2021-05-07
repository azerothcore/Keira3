import { TestBed } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { FormGroup } from 'ngx-typesafe-forms';

import { SpellDbcItemsComponent } from './spell-dbc-items.component';
import { SpellDbcModule } from '../spell-dbc.module';
import { PageObject } from '@keira-testing/page-object';
import { SpellDbcService } from '../spell-dbc.service';
import { SpellHandlerService } from '../../spell-handler.service';
import { SpellDbc } from '@keira-types/spell-dbc.type';

describe('SpellDbcItemsComponent', () => {

  class SpellDbcItemsComponentPage extends PageObject<TestHostComponent> {}

  @Component({
    template: '<keira-spell-dbc-items [formGroup]="form"></keira-spell-dbc-items>'
  })
  class TestHostComponent {
    @ViewChild(SpellDbcItemsComponent) child: SpellDbcItemsComponent;
    form: FormGroup<SpellDbc>;
  }

  const fields: string[] = [
    'Totem_1',
    'Totem_2',
    'EquippedItemClass',
    'EquippedItemSubclass',
    'EquippedItemInvTypes',
    'Reagent_1',
    'Reagent_2',
    'Reagent_3',
    'Reagent_4',
    'Reagent_5',
    'Reagent_6',
    'Reagent_7',
    'Reagent_8',
    'ReagentCount_1',
    'ReagentCount_2',
    'ReagentCount_3',
    'ReagentCount_4',
    'ReagentCount_5',
    'ReagentCount_6',
    'ReagentCount_7',
    'ReagentCount_8',
  ];
  const createMockVal = (field: string): number => field.length;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestHostComponent, SpellDbcItemsComponent ],
      imports: [
        SpellDbcModule,
        RouterTestingModule,
      ],
      providers: [ SpellHandlerService ],
    })
      .compileComponents();
  });

  const setup = () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    const host = fixture.componentInstance;
    const page = new SpellDbcItemsComponentPage(fixture);
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
    const { page, form} = setup();
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
