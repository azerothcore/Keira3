import { Component, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateTestingModule } from '@keira-shared/testing/translate-module';
import { ModelForm } from '@keira-shared/utils/helpers';
import { PageObject } from '@keira-testing/page-object';
import { SpellDbc } from '@keira-types/spell-dbc.type';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { SpellHandlerService } from '../../spell-handler.service';
import { SpellDbcModule } from '../spell-dbc.module';
import { SpellDbcService } from '../spell-dbc.service';
import { SpellDbcMiscComponent } from './spell-dbc-misc.component';

describe('SpellDbcMiscComponent', () => {
  class SpellDbcMiscComponentPage extends PageObject<TestHostComponent> {}

  @Component({
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default, // TODO: migrate to OnPush: https://github.com/azerothcore/Keira3/issues/2602
    template: '<keira-spell-dbc-misc [formGroup]="form"></keira-spell-dbc-misc>',
  })
  class TestHostComponent {
    @ViewChild(SpellDbcMiscComponent) child: SpellDbcMiscComponent;
    form: FormGroup<ModelForm<SpellDbc>>;
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
