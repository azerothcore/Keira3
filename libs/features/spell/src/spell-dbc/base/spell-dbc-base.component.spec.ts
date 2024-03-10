import { Component, ViewChild } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { PageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModelForm } from '@keira/shared/core';
import { SpellDbc } from '@keira/shared/acore-world-model';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { SpellHandlerService } from '../../spell-handler.service';

import { SpellDbcService } from '../spell-dbc.service';
import { SpellDbcBaseComponent } from './spell-dbc-base.component';

describe('SpellDbcBaseComponent', () => {
  class SpellDbcBaseComponentPage extends PageObject<TestHostComponent> {}

  @Component({
    template: '<keira-spell-dbc-base [formGroup]="form"></keira-spell-dbc-base>',
    standalone: true,
    imports: [RouterTestingModule, TranslateTestingModule, SpellDbcBaseComponent],
  })
  class TestHostComponent {
    @ViewChild(SpellDbcBaseComponent) child: SpellDbcBaseComponent;
    form: FormGroup<ModelForm<SpellDbc>>;
  }

  const fields: string[] = [
    'Category',
    'SpellDescriptionVariableID',
    'BaseLevel',
    'SpellLevel',
    'MaxLevel',
    'MinFactionID',
    'MinReputation',
    'SpellDifficultyID',
    'RequiredAreasID',
    'SpellClassSet',
    'PowerType',
    'ManaCost',
    'ManaCostPerLevel',
    'ManaPerSecond',
    'ManaPerSecondPerLevel',
    'ManaCostPct',
    'RuneCostID',
    'Mechanic',
    'DefenseType',
    'PreventionType',
    'DispelType',
    'SchoolMask',
    'RangeIndex',
    'MaxTargets',
    'MaxTargetLevel',
    'CasterAuraState',
    'ExcludeCasterAuraState',
    'CasterAuraSpell',
    'ExcludeCasterAuraSpell',
    'TargetAuraState',
    'ExcludeTargetAuraState',
    'TargetAuraSpell',
    'ExcludeTargetAuraSpell',
    'RequiresSpellFocus',
    'CumulativeAura',
    'RecoveryTime',
    'CategoryRecoveryTime',
    'CastingTimeIndex',
    'DurationIndex',
    'Speed',
    'SpellIconID',
    'ActiveIconID',
    'StanceBarOrder',
    'SpellVisualID_1',
    'SpellVisualID_2',
    'SpellMissileID',
    'PowerDisplayID',
  ];
  const createMockVal = (field: string): number => field.length;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        ModalModule.forRoot(),
        ToastrModule.forRoot(),
        TooltipModule.forRoot(),
        RouterTestingModule,
        TranslateTestingModule,
        TestHostComponent,
        SpellDbcBaseComponent,
      ],
      providers: [SpellHandlerService],
    }).compileComponents();
  }));

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
