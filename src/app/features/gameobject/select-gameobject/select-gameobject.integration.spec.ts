import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import Spy = jasmine.Spy;

import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { SelectGameobjectComponent } from './select-gameobject.component';
import { SelectGameobjectService } from './select-gameobject.service';
import { SelectGameobjectModule } from './select-gameobject.module';
import { SelectPageObject } from '@keira-testing/select-page-object';
import { GameobjectTemplate } from '@keira-types/gameobject-template.type';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { SaiGameobjectHandlerService } from '../sai-gameobject-handler.service';

class SelectGameobjectComponentPage extends SelectPageObject<SelectGameobjectComponent> {
  ID_FIELD = 'entry';
}

describe('SelectGameobject integration tests', () => {
  let component: SelectGameobjectComponent;
  let fixture: ComponentFixture<SelectGameobjectComponent>;
  let selectService: SelectGameobjectService;
  let page: SelectGameobjectComponentPage;
  let queryService: MysqlQueryService;
  let querySpy: Spy;
  let navigateSpy: Spy;

  const value = 1200;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SelectGameobjectModule,
        RouterTestingModule,
      ],
      providers: [
        GameobjectHandlerService,
        SaiGameobjectHandlerService,
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    navigateSpy = spyOn(TestBed.inject(Router), 'navigate');
    queryService = TestBed.inject(MysqlQueryService);
    querySpy = spyOn(queryService, 'query').and.returnValue(of(
      [{ max: 1 }]
    ));

    selectService = TestBed.inject(SelectGameobjectService);

    fixture = TestBed.createComponent(SelectGameobjectComponent);
    page = new SelectGameobjectComponentPage(fixture);
    component = fixture.componentInstance;
    fixture.autoDetectChanges(true);
    fixture.detectChanges();
  });

  it('should correctly initialise', async () => {
    await fixture.whenStable();
    expect(page.createInput.value).toEqual(`${component.customStartingId}`);
    page.expectNewEntityFree();
    expect(querySpy).toHaveBeenCalledWith(
      'SELECT MAX(entry) AS max FROM gameobject_template;'
    );
    expect(page.queryWrapper.innerText).toContain(
      'SELECT * FROM `gameobject_template` LIMIT 50'
    );
  });

  it('should correctly behave when inserting and selecting free id', async () => {
    await fixture.whenStable();
    querySpy.calls.reset();
    querySpy.and.returnValue(of([]));

    page.setInputValue(page.createInput, value);

    expect(querySpy).toHaveBeenCalledTimes(1);
    expect(querySpy).toHaveBeenCalledWith(
      `SELECT * FROM \`gameobject_template\` WHERE (entry = ${value})`
    );
    page.expectNewEntityFree();

    page.clickElement(page.selectNewBtn);

    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(['gameobject/gameobject-template']);
    page.expectTopBarCreatingNew(value);
  });

  it('should correctly behave when inserting an existing entity', async () => {
    await fixture.whenStable();
    querySpy.calls.reset();
    querySpy.and.returnValue(of(
      ['mock value']
    ));

    page.setInputValue(page.createInput, value);

    expect(querySpy).toHaveBeenCalledTimes(1);
    expect(querySpy).toHaveBeenCalledWith(
      `SELECT * FROM \`gameobject_template\` WHERE (entry = ${value})`
    );
    page.expectEntityAlreadyInUse();
  });

  for (const { testId, id, name, limit, expectedQuery } of [
    {
      testId: 1, id: 1200, name: `Solid Chest`, limit: '100', expectedQuery:
        'SELECT * FROM `gameobject_template` WHERE (`entry` LIKE \'%1200%\') AND (`name` LIKE \'%Solid Chest%\') LIMIT 100'
    },
    {
      testId: 2, id: '', name: `Solid Chest`, limit: '100', expectedQuery:
        'SELECT * FROM `gameobject_template` WHERE (`name` LIKE \'%Solid Chest%\') LIMIT 100'
    },
    {
      testId: 3, id: '', name: `Solid Chest`, limit: '100', expectedQuery:
        'SELECT * FROM `gameobject_template` WHERE (`name` LIKE \'%Solid Chest%\') LIMIT 100'
    },
    {
      testId: 4, id: 1200, name: '', limit: '', expectedQuery:
        'SELECT * FROM `gameobject_template` WHERE (`entry` LIKE \'%1200%\')'
    },
  ]) {
    it(`searching an existing entity should correctly work [${testId}]`, () => {
      querySpy.calls.reset();
      if (id) {
        page.setInputValue(page.searchIdInput, id);
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
    const results: Partial<GameobjectTemplate>[] = [
      { id: 1, name: 'An awesome Gameobject 1', GameobjectType: 0, GameobjectDisplayId: 1   },
      { id: 2, name: 'An awesome Gameobject 2', GameobjectType: 0, GameobjectDisplayId: 2   },
      { id: 3, name: 'An awesome Gameobject 3', GameobjectType: 0, GameobjectDisplayId: 3   },
    ];
    querySpy.calls.reset();
    querySpy.and.returnValue(of(results));

    page.clickElement(page.searchBtn);

    const row0 = page.getDatatableRowExternal(page.DT_SELECTOR, 0);
    const row1 = page.getDatatableRowExternal(page.DT_SELECTOR, 1);
    const row2 = page.getDatatableRowExternal(page.DT_SELECTOR, 2);

    expect(row0.innerText).toContain(results[0].name);
    expect(row1.innerText).toContain(results[1].name);
    expect(row2.innerText).toContain(results[2].name);

    page.clickElement(page.getDatatableCellExternal(page.DT_SELECTOR, 1, 1));

    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(['gameobject/gameobject-template']);
    page.expectTopBarEditing(results[1].entry, results[1].name);
  });
});
