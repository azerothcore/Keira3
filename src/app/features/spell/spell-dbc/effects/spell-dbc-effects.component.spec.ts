import { TestBed } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { FormGroup } from 'ngx-typesafe-forms';

import { SpellDbcEffectsComponent } from './spell-dbc-effects.component';
import { SpellDbcModule } from '../spell-dbc.module';
import { PageObject } from '@keira-testing/page-object';
import { SpellDbcService } from '../spell-dbc.service';
import { SpellHandlerService } from '../../spell-handler.service';
import { SpellDbc } from '@keira-types/spell-dbc.type';

describe('SpellDbcEffectsComponent', () => {
  class SpellDbcEffectsComponentPage extends PageObject<TestHostComponent> {
    getTargets(): HTMLInputElement {
      return this.query('#Targets');
    }
    getProcTypeMask(): HTMLInputElement {
      return this.query('#ProcTypeMask');
    }
    getProcChance(): HTMLInputElement {
      return this.query('#ProcChance');
    }
    getProcCharges(): HTMLInputElement {
      return this.query('#ProcCharges');
    }
  }

  @Component({
    template: '<keira-spell-dbc-effects [formGroup]="form"></keira-spell-dbc-effects>',
  })
  class TestHostComponent {
    @ViewChild(SpellDbcEffectsComponent) child: SpellDbcEffectsComponent;
    form: FormGroup<SpellDbc>;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestHostComponent, SpellDbcEffectsComponent],
      imports: [SpellDbcModule, RouterTestingModule],
      providers: [SpellHandlerService],
    }).compileComponents();
  });

  const setup = () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    const host = fixture.componentInstance;
    const page = new SpellDbcEffectsComponentPage(fixture);
    const form = TestBed.inject(SpellDbcService).form;
    host.form = form;

    fixture.detectChanges();
    const component = host.child;

    return { fixture, component, page, form };
  };

  it('should correctly display the fields', () => {
    const { page } = setup();
    expect(page.getTargets());
    expect(page.getProcTypeMask());
    expect(page.getProcChance());
    expect(page.getProcCharges());
  });
});
