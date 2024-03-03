import { Component, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateTestingModule } from '@keira/test-utils';
import { ModelForm } from '@keira-shared/utils/helpers';
import { PageObject } from '@keira/test-utils';
import { SpellDbc } from '@keira/acore-world-model';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { SpellHandlerService } from '../../spell-handler.service';
import { SpellDbcModule } from '../spell-dbc.module';
import { SpellDbcService } from '../spell-dbc.service';
import { SpellDbcItemsComponent } from './spell-dbc-items.component';

describe('SpellDbcItemsComponent', () => {
  class SpellDbcItemsComponentPage extends PageObject<TestHostComponent> {}

  @Component({
    template: '<keira-spell-dbc-items [formGroup]="form"></keira-spell-dbc-items>',
  })
  class TestHostComponent {
    @ViewChild(SpellDbcItemsComponent) child: SpellDbcItemsComponent;
    form: FormGroup<ModelForm<SpellDbc>>;
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
      declarations: [TestHostComponent, SpellDbcItemsComponent],
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
      form.get(field).setValue(createMockVal(field));
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
      expect(form.get(field).value).toEqual(createMockVal(field));
    }
  });
});
