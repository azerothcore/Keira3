import { Component, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { KeiraPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModelForm } from '@keira/shared/utils';
import { SpellDbc } from '@keira/shared/acore-world-model';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { SpellHandlerService } from '../../spell-handler.service';
import { SpellDbcService } from '../spell-dbc.service';
import { SpellDbcTextsComponent } from './spell-dbc-texts.component';
import { LOCALES } from './spell-dbc-texts.model';

describe('SpellDbcTextsComponent', () => {
  class SpellDbcTextsComponentPage extends KeiraPageObject<TestHostComponent> {
    readonly localesTabsetId = 'locales';
  }

  @Component({
    template: '<keira-spell-dbc-texts [formGroup]="form" />',
    standalone: true,
    imports: [RouterTestingModule, TranslateTestingModule, SpellDbcTextsComponent],
  })
  class TestHostComponent {
    @ViewChild(SpellDbcTextsComponent) child!: SpellDbcTextsComponent;
    form!: FormGroup<ModelForm<SpellDbc>>;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ToastrModule.forRoot(),
        TooltipModule.forRoot(),
        RouterTestingModule,
        TranslateTestingModule,
        TestHostComponent,
        SpellDbcTextsComponent,
      ],
      providers: [SpellHandlerService],
    }).compileComponents();
  });

  const setup = () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    const host = fixture.componentInstance;
    const page = new SpellDbcTextsComponentPage(fixture);
    const form = TestBed.inject(SpellDbcService).form;
    host.form = form;

    fixture.detectChanges();
    const component = host.child;

    return { fixture, component, page, form };
  };

  it('should correctly display the locale tabs', () => {
    const { page } = setup();

    for (const locale of LOCALES) {
      const tab = page.getTab(page.localesTabsetId, locale);
      expect(tab).toBeDefined();

      if (locale === 'enUS') {
        page.expectTabActive(tab);
      } else {
        page.expectTabInactive(tab);
      }
    }
  });
});
