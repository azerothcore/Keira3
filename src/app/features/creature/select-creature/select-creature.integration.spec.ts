import { TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { SelectCreatureComponent } from './select-creature.component';
import { SelectCreatureService } from './select-creature.service';
import { SelectCreatureModule } from './select-creature.module';
import { CreatureTemplate } from '@keira-types/creature-template.type';
import { SelectPageObject } from '@keira-testing/select-page-object';
import { CreatureHandlerService } from '../creature-handler.service';
import { SaiCreatureHandlerService } from '../sai-creature-handler.service';
import Spy = jasmine.Spy;

class SelectCreatureComponentPage extends SelectPageObject<SelectCreatureComponent> {
  ID_FIELD = 'entry';
  get searchSubnameInput() { return this.query<HTMLInputElement>('#subname'); }
}

describe('SelectCreature integration tests', () => {

  const value = 1200;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        SelectCreatureModule,
        RouterTestingModule,
      ],
      providers: [
        CreatureHandlerService,
        SaiCreatureHandlerService,
      ]
    })
      .compileComponents();
  }));

  const setup = () => {
    const navigateSpy = spyOn(TestBed.inject(Router), 'navigate');
    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy: Spy = spyOn(queryService, 'query').and.returnValue(of(
      [{ max: 1 }]
    ));

    const selectService = TestBed.inject(SelectCreatureService);

    const fixture = TestBed.createComponent(SelectCreatureComponent);
    const page = new SelectCreatureComponentPage(fixture);
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
    expect(querySpy).toHaveBeenCalledWith(
      'SELECT MAX(entry) AS max FROM creature_template;'
    );
    expect(page.queryWrapper.innerText).toContain(
      'SELECT * FROM `creature_template` LIMIT 50'
    );
  }));

  it('should correctly behave when inserting and selecting free entry', waitForAsync(async () => {
    const { navigateSpy, querySpy, fixture, page } = setup();
    await fixture.whenStable();
    querySpy.calls.reset();
    querySpy.and.returnValue(of([]));

    page.setInputValue(page.createInput, value);

    expect(querySpy).toHaveBeenCalledTimes(1);
    expect(querySpy).toHaveBeenCalledWith(
      `SELECT * FROM \`creature_template\` WHERE (entry = ${value})`
    );
    page.expectNewEntityFree();

    page.clickElement(page.selectNewBtn);

    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(['creature/creature-template']);
    page.expectTopBarCreatingNew(value);

  }));

  it('should correctly behave when inserting an existing entity', waitForAsync(async () => {
    const { querySpy, fixture, page } = setup();
    await fixture.whenStable();
    querySpy.calls.reset();
    querySpy.and.returnValue(of(['mock value']));

    page.setInputValue(page.createInput, value);

    expect(querySpy).toHaveBeenCalledTimes(1);
    expect(querySpy).toHaveBeenCalledWith(
      `SELECT * FROM \`creature_template\` WHERE (entry = ${value})`
    );
    page.expectEntityAlreadyInUse();
  }));

  for (const { id, entry, name, subname, limit, expectedQuery } of [
    {
      id: 1, entry: 1200, name: 'Helias', subname: 'Dev', limit: '100', expectedQuery:
        'SELECT * FROM `creature_template` ' +
        'WHERE (`entry` LIKE \'%1200%\') AND (`name` LIKE \'%Helias%\') AND (`subname` LIKE \'%Dev%\') LIMIT 100'
    },
    {
      id: 2, entry: '', name: 'Helias', subname: 'Dev', limit: '100', expectedQuery:
        'SELECT * FROM `creature_template` WHERE (`name` LIKE \'%Helias%\') AND (`subname` LIKE \'%Dev%\') LIMIT 100'
    },
    {
      id: 3, entry: '', name: 'Helias', subname: '', limit: '100', expectedQuery:
        'SELECT * FROM `creature_template` WHERE (`name` LIKE \'%Helias%\') LIMIT 100'
    },
    {
      id: 4, entry: '', name: '', subname: `it's a cool dev!`, limit: '', expectedQuery:
        'SELECT * FROM `creature_template` WHERE (`subname` LIKE \'%it\\\'s a cool dev!%\')'
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
      if (subname) {
        page.setInputValue(page.searchSubnameInput, subname);
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
    const results: Partial<CreatureTemplate>[] = [
      { entry: 1, name: 'Shin',   subname: 'Developer',    minlevel: 1, maxlevel: 80, AIName: '', ScriptName: 'Shin.cpp'   },
      { entry: 2, name: 'Helias', subname: 'Developer',    minlevel: 1, maxlevel: 80, AIName: '', ScriptName: 'Helias.cpp' },
      { entry: 3, name: 'Kalhac', subname: 'Mathmatician', minlevel: 1, maxlevel: 80, AIName: '', ScriptName: 'Kalhac.cpp' },
    ];
    querySpy.calls.reset();
    querySpy.and.returnValue(of(results));

    page.clickElement(page.searchBtn);

    const row0 = page.getDatatableRowExternal(0);
    const row1 = page.getDatatableRowExternal(1);
    const row2 = page.getDatatableRowExternal(2);

    expect(row0.innerText).toContain(results[0].name);
    expect(row1.innerText).toContain(results[1].name);
    expect(row2.innerText).toContain(results[2].name);

    page.clickElement(page.getDatatableCellExternal(1, 1));

    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(['creature/creature-template']);
    page.expectTopBarEditing(results[1].entry, results[1].name);
  });
});
