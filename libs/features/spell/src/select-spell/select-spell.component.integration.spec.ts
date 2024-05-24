import { TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { SelectPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { SPELL_DBC_ID, SPELL_DBC_NAME, SpellDbc } from '@keira/shared/acore-world-model';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { SpellHandlerService } from '../spell-handler.service';
import { SelectSpellComponent } from './select-spell.component';
import { SelectSpellService } from './select-spell.service';
import Spy = jasmine.Spy;
import { KEIRA_APP_CONFIG_TOKEN, KEIRA_MOCK_CONFIG } from '@keira/shared/config';

class SelectSpellComponentPage extends SelectPageObject<SelectSpellComponent> {
  override ID_FIELD = SPELL_DBC_ID;
  get searchSubnameInput(): HTMLInputElement {
    return this.query<HTMLInputElement>('#subname');
  }
}

describe('SelectSpell integration tests', () => {
  const value = 1200;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule, ToastrModule.forRoot(), ModalModule.forRoot(), RouterTestingModule, TranslateTestingModule],
      providers: [SpellHandlerService, { provide: KEIRA_APP_CONFIG_TOKEN, useValue: KEIRA_MOCK_CONFIG }],
    }).compileComponents();
  }));

  const setup = () => {
    const navigateSpy = spyOn(TestBed.inject(Router), 'navigate');
    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy: Spy = spyOn(queryService, 'query').and.returnValue(of([{ max: 1 }]));

    const selectService = TestBed.inject(SelectSpellService);

    const fixture = TestBed.createComponent(SelectSpellComponent);
    const page = new SelectSpellComponentPage(fixture);
    const component = fixture.componentInstance;
    fixture.autoDetectChanges(true);
    fixture.detectChanges();

    return { navigateSpy, queryService, querySpy, selectService, fixture, page, component };
  };

  it('should correctly initialise', waitForAsync(async () => {
    const { querySpy, fixture, page, component } = setup();
    await fixture.whenStable();
    expect(page.createInput.value).toEqual(`${component.customStartingId}`);
    page.expectNewEntityFree();
    expect(querySpy).toHaveBeenCalledWith(`SELECT MAX(${SPELL_DBC_ID}) AS max FROM spell_dbc;`);
    expect(page.queryWrapper.innerText).toContain('SELECT * FROM `spell_dbc` LIMIT 50');
  }));

  it('should correctly behave when inserting and selecting free entry', waitForAsync(async () => {
    const { navigateSpy, querySpy, fixture, page } = setup();
    await fixture.whenStable();
    querySpy.calls.reset();
    querySpy.and.returnValue(of([]));

    page.setInputValue(page.createInput, value);

    expect(querySpy).toHaveBeenCalledTimes(1);
    expect(querySpy).toHaveBeenCalledWith(`SELECT * FROM \`spell_dbc\` WHERE (${SPELL_DBC_ID} = ${value})`);
    page.expectNewEntityFree();

    page.clickElement(page.selectNewBtn);

    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(['spell/spell-dbc']);
    page.expectTopBarCreatingNew(value);
  }));

  it('should correctly behave when inserting an existing entity', waitForAsync(async () => {
    const { querySpy, fixture, page } = setup();
    await fixture.whenStable();
    querySpy.calls.reset();
    querySpy.and.returnValue(of(['mock value']));

    page.setInputValue(page.createInput, value);

    expect(querySpy).toHaveBeenCalledTimes(1);
    expect(querySpy).toHaveBeenCalledWith(`SELECT * FROM \`spell_dbc\` WHERE (${SPELL_DBC_ID} = ${value})`);
    page.expectEntityAlreadyInUse();
  }));

  for (const { id, entry, name, limit, expectedQuery } of [
    {
      id: 1,
      entry: 1200,
      name: 'Fireball',
      limit: '100',
      expectedQuery:
        'SELECT * FROM `spell_dbc` ' +
        'WHERE (`' +
        SPELL_DBC_ID +
        "` LIKE '%1200%') AND (`" +
        SPELL_DBC_NAME +
        "` LIKE '%Fireball%') LIMIT 100",
    },
    {
      id: 2,
      entry: '',
      name: 'Fireball',
      limit: '100',
      expectedQuery: 'SELECT * FROM `spell_dbc` WHERE (`' + SPELL_DBC_NAME + "` LIKE '%Fireball%') LIMIT 100",
    },
  ]) {
    it(`searching an existing entity should correctly work [${id}]`, () => {
      const { querySpy, page } = setup();
      querySpy.calls.reset();
      if (entry) {
        page.setInputValue(page.searchIdInput, entry);
      }
      if (name) {
        page.setInputValue(page.searchNameInput, name);
      }
      page.setInputValue(page.searchLimitInput, limit);

      expect(page.queryWrapper.innerText).toContain(expectedQuery);

      page.clickElement(page.searchBtn);

      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy).toHaveBeenCalledWith(expectedQuery);
    });
  }

  it('searching and selecting an existing entity from the datatable should correctly work', () => {
    const { navigateSpy, querySpy, page } = setup();
    const results: Partial<SpellDbc>[] = [
      { [SPELL_DBC_ID]: 1, [SPELL_DBC_NAME]: 'Fear' },
      { [SPELL_DBC_ID]: 2, [SPELL_DBC_NAME]: 'Fireball' },
      { [SPELL_DBC_ID]: 3, [SPELL_DBC_NAME]: 'Heal' },
    ];
    querySpy.calls.reset();
    querySpy.and.returnValue(of(results));

    page.clickElement(page.searchBtn);

    const row0 = page.getDatatableRowExternal(0);
    const row1 = page.getDatatableRowExternal(1);
    const row2 = page.getDatatableRowExternal(2);

    expect(row0.innerText).toContain(results[0][SPELL_DBC_NAME] as string);
    expect(row1.innerText).toContain(results[1][SPELL_DBC_NAME] as string);
    expect(row2.innerText).toContain(results[2][SPELL_DBC_NAME] as string);

    page.clickElement(page.getDatatableCellExternal(1, 1));

    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(['spell/spell-dbc']);
    page.expectTopBarEditing(results[1][SPELL_DBC_ID] as number, results[1][SPELL_DBC_NAME] as string);
  });
});
