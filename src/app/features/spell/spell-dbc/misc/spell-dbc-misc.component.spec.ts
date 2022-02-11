import { TestBed } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { FormGroup } from 'ngx-typesafe-forms';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';

import { SpellDbcMiscComponent } from './spell-dbc-misc.component';
import { SpellDbcModule } from '../spell-dbc.module';
import { PageObject } from '@keira-testing/page-object';
import { SpellDbcService } from '../spell-dbc.service';
import { SpellHandlerService } from '../../spell-handler.service';
import { SpellDbc } from '@keira-types/spell-dbc.type';
import { ModalModule } from 'ngx-bootstrap/modal';

describe('SpellDbcMiscComponent', () => {
  class SpellDbcMiscComponentPage extends PageObject<TestHostComponent> {}

  @Component({
    template: '<keira-spell-dbc-misc [formGroup]="form"></keira-spell-dbc-misc>',
  })
  class TestHostComponent {
    @ViewChild(SpellDbcMiscComponent) child: SpellDbcMiscComponent;
    form: FormGroup<SpellDbc>;
  }

  const fields: string[] = [
    'unk_320_2',
    'unk_320_3',
    'StartRecoveryCategory',
    'StartRecoveryTime',
    'ModalNextSpell',
    'SpellPriority',
    'RequiredAuraVision',
  ];
  const createMockVal = (field: string): number => field.length;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestHostComponent, SpellDbcMiscComponent],
      imports: [ModalModule.forRoot(), ToastrModule.forRoot(), TooltipModule.forRoot(), SpellDbcModule, RouterTestingModule],
      providers: [SpellHandlerService],
    }).compileComponents();
  });

  const setup = () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    const host = fixture.componentInstance;
    const page = new SpellDbcMiscComponentPage(fixture);
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
