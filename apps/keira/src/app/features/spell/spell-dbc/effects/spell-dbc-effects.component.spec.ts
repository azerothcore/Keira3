import { Component, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { PageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModelForm } from '@keira/shared/core';
import { SpellDbc } from '@keira/shared/acore-world-model';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
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
    standalone: true,
    imports: [SpellDbcModule, RouterTestingModule, TranslateTestingModule, SpellDbcEffectsComponent],
  })
  class TestHostComponent {
    @ViewChild(SpellDbcEffectsComponent) child: SpellDbcEffectsComponent;
    form: FormGroup<ModelForm<SpellDbc>>;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ModalModule.forRoot(),
        ToastrModule.forRoot(),
        TooltipModule.forRoot(),
        SpellDbcModule,
        RouterTestingModule,
        TranslateTestingModule,
        TestHostComponent,
        SpellDbcEffectsComponent,
      ],
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
