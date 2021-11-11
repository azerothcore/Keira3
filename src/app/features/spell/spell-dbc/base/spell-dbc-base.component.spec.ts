import { TestBed, waitForAsync } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { FormGroup } from 'ngx-typesafe-forms';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';

import { SpellDbcBaseComponent } from './spell-dbc-base.component';
import { SpellDbcModule } from '../spell-dbc.module';
import { PageObject } from '@keira-testing/page-object';
import { SpellDbcService } from '../spell-dbc.service';
import { SpellHandlerService } from '../../spell-handler.service';
import { SpellDbc } from '@keira-types/spell-dbc.type';
import { ModalModule } from 'ngx-bootstrap/modal';

describe('SpellDbcBaseComponent', () => {
  class SpellDbcBaseComponentPage extends PageObject<TestHostComponent> {}

  @Component({
    template: '<keira-spell-dbc-base [formGroup]="form"></keira-spell-dbc-base>',
  })
  class TestHostComponent {
    @ViewChild(SpellDbcBaseComponent) child: SpellDbcBaseComponent;
    form: FormGroup<SpellDbc>;
  }

  const fields: string[] = [
    'Category',
    'DispelType',
    'Mechanic',
    'CastingTimeIndex',
    'DurationIndex',
    'RangeIndex',
    'CasterAuraState',
    'SpellLevel',
    'BaseLevel',
    'MaxLevel',
    'MaxTargets',
    'MaxTargetLevel',
    'RuneCostID',
    'SpellVisualID_1',
    'SpellVisualID_2',
    'Speed',
    'TargetAuraState',
    'RecoveryTime',
    'SpellMissileID',
    'SpellDifficultyID',
    'PowerType',
    'RequiredTotemCategoryID_1',
    'RequiredTotemCategoryID_2',
    'RequiredAreasID',
    'SpellDescriptionVariableID',
    'ManaCost',
    'ManaCostPerLevel',
    'ManaPerSecond',
    'ManaPerSecondPerLevel',
    'ManaCostPct',
    'PreventionType',
    'RequiresSpellFocus',
  ];
  const createMockVal = (field: string): number => field.length;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [TestHostComponent, SpellDbcBaseComponent],
        imports: [ModalModule.forRoot(), ToastrModule.forRoot(), TooltipModule.forRoot(), SpellDbcModule, RouterTestingModule],
        providers: [SpellHandlerService],
      }).compileComponents();
    }),
  );

  const setup = () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    const host = fixture.componentInstance;
    const page = new SpellDbcBaseComponentPage(fixture);
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
