import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService } from '@keira-shared/services/query/mysql-query.service';
import { TranslateTestingModule } from '@keira-shared/testing/translate-module';
import { SelectPageObject } from '@keira-testing/select-page-object';
import { GameobjectTemplate } from '@keira/acore-world-model';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { SaiGameobjectHandlerService } from '../sai-gameobject-handler.service';
import { SelectGameobjectComponent } from './select-gameobject.component';
import { SelectGameobjectModule } from './select-gameobject.module';
import Spy = jasmine.Spy;

class SelectGameobjectComponentPage extends SelectPageObject<SelectGameobjectComponent> {
  ID_FIELD = 'entry';
}

describe('SelectGameobject integration tests', () => {
  let component: SelectGameobjectComponent;
  let fixture: ComponentFixture<SelectGameobjectComponent>;
  let page: SelectGameobjectComponentPage;
  let queryService: MysqlQueryService;
  let querySpy: Spy;
  let navigateSpy: Spy;

  const value = 1200;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalModule.forRoot(), SelectGameobjectModule, RouterTestingModule, TranslateTestingModule],
      providers: [GameobjectHandlerService, SaiGameobjectHandlerService],
    }).compileComponents();
  }));

  beforeEach(() => {
    navigateSpy = spyOn(TestBed.inject(Router), 'navigate');
    queryService = TestBed.inject(MysqlQueryService);
    querySpy = spyOn(queryService, 'query').and.returnValue(of([{ max: 1 }]));

    fixture = TestBed.createComponent(SelectGameobjectComponent);
    page = new SelectGameobjectComponentPage(fixture);
    component = fixture.componentInstance;
    fixture.autoDetectChanges(true);
    fixture.detectChanges();
  });

  it('should correctly initialise', waitForAsync(async () => {
    await fixture.whenStable();
    expect(page.createInput.value).toEqual(`${component.customStartingId}`);
    page.expectNewEntityFree();
    expect(querySpy).toHaveBeenCalledWith('SELECT MAX(entry) AS max FROM gameobject_template;');
    expect(page.queryWrapper.innerText).toContain('SELECT * FROM `gameobject_template` LIMIT 50');
  }));

  it('should correctly behave when inserting and selecting free id', waitForAsync(async () => {
    await fixture.whenStable();
    querySpy.calls.reset();
    querySpy.and.returnValue(of([]));

    page.setInputValue(page.createInput, value);

    expect(querySpy).toHaveBeenCalledTimes(1);
    expect(querySpy).toHaveBeenCalledWith(`SELECT * FROM \`gameobject_template\` WHERE (entry = ${value})`);
    page.expectNewEntityFree();

    page.clickElement(page.selectNewBtn);

    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(['gameobject/gameobject-template']);
    page.expectTopBarCreatingNew(value);
  }));

  it('should correctly behave when inserting an existing entity', waitForAsync(async () => {
    await fixture.whenStable();
    querySpy.calls.reset();
    querySpy.and.returnValue(of(['mock value']));

    page.setInputValue(page.createInput, value);

    expect(querySpy).toHaveBeenCalledTimes(1);
    expect(querySpy).toHaveBeenCalledWith(`SELECT * FROM \`gameobject_template\` WHERE (entry = ${value})`);
    page.expectEntityAlreadyInUse();
  }));

  for (const { testId, id, name, scriptName, limit, expectedQuery } of [
    {
      testId: 1,
      id: 1200,
      name: `Solid Chest`,
      scriptName: '',
      limit: '100',
      expectedQuery: "SELECT * FROM `gameobject_template` WHERE (`entry` LIKE '%1200%') AND (`name` LIKE '%Solid Chest%') LIMIT 100",
    },
    {
      testId: 2,
      id: '',
      name: `Solid Chest`,
      scriptName: '',
      limit: '100',
      expectedQuery: "SELECT * FROM `gameobject_template` WHERE (`name` LIKE '%Solid Chest%') LIMIT 100",
    },
    {
      testId: 3,
      id: '',
      name: `Solid Chest`,
      scriptName: '',
      limit: '100',
      expectedQuery: "SELECT * FROM `gameobject_template` WHERE (`name` LIKE '%Solid Chest%') LIMIT 100",
    },
    {
      testId: 4,
      id: 1200,
      name: '',
      scriptName: '',
      limit: '',
      expectedQuery: "SELECT * FROM `gameobject_template` WHERE (`entry` LIKE '%1200%')",
    },
    {
      testId: 5,
      id: '',
      name: '',
      scriptName: 'go_f',
      limit: '',
      expectedQuery: "SELECT * FROM `gameobject_template` WHERE (`ScriptName` LIKE '%go_f%')",
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
      if (scriptName) {
        page.setInputValue(page.searchScriptNameInput, scriptName);
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
      { id: 1, name: 'An awesome Gameobject 1', GameobjectType: 0, GameobjectDisplayId: 1 },
      { id: 2, name: 'An awesome Gameobject 2', GameobjectType: 0, GameobjectDisplayId: 2 },
      { id: 3, name: 'An awesome Gameobject 3', GameobjectType: 0, GameobjectDisplayId: 3 },
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
    expect(navigateSpy).toHaveBeenCalledWith(['gameobject/gameobject-template']);
    page.expectTopBarEditing(results[1].entry, results[1].name);
  });
});
