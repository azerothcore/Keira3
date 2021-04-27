import { TestBed } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';

import { SpellDbcTextsComponent } from './spell-dbc-texts.component';
import { SpellDbcModule } from '../spell-dbc.module';
import { PageObject } from '@keira-testing/page-object';
import { SpellDbcService } from '../spell-dbc.service';
import { SpellHandlerService } from '../../spell-handler.service';
import { LOCALES } from './spell-dbc-texts.model';
import { FormGroup } from 'ngx-typesafe-forms';
import { SpellDbc } from '@keira-types/spell-dbc.type';

describe('SpellDbcTextsComponent', () => {

  class SpellDbcTextsComponentPage extends PageObject<TestHostComponent> {
    readonly localesTabsetId = 'locales';
  }

  @Component({
    template: '<keira-spell-dbc-texts [formGroup]="form"></keira-spell-dbc-texts>'
  })
  class TestHostComponent {
    @ViewChild(SpellDbcTextsComponent) child: SpellDbcTextsComponent;
    form: FormGroup<SpellDbc>;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestHostComponent, SpellDbcTextsComponent ],
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
