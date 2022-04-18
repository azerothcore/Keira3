import { Component, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { PageObject } from '@keira-testing/page-object';
import { SpellDbc } from '@keira-types/spell-dbc.type';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { FormGroup } from 'ngx-typesafe-forms';
import { SpellHandlerService } from '../../spell-handler.service';
import { SpellDbcModule } from '../spell-dbc.module';
import { SpellDbcService } from '../spell-dbc.service';
import { SpellDbcEffectsComponent } from './spell-dbc-effects.component';

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
      imports: [ModalModule.forRoot(), ToastrModule.forRoot(), TooltipModule.forRoot(), SpellDbcModule, RouterTestingModule],
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
