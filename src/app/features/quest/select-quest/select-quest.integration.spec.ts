import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import Spy = jasmine.Spy;

import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { SelectQuestComponent } from './select-quest.component';
import { SelectQuestService } from './select-quest.service';
import { SelectQuestModule } from './select-quest.module';
import { QuestTemplate } from '@keira-types/quest-template.type';
import { SelectPageObject } from '@keira-testing/select-page-object';
import { QuestHandlerService } from '../quest-handler.service';

class SelectQuestComponentPage extends SelectPageObject<SelectQuestComponent> {
  ID_FIELD = 'ID';
}

describe('SelectQuest integration tests', () => {
  let component: SelectQuestComponent;
  let fixture: ComponentFixture<SelectQuestComponent>;
  let selectService: SelectQuestService;
  let page: SelectQuestComponentPage;
  let queryService: MysqlQueryService;
  let querySpy: Spy;
  let navigateSpy: Spy;

  const value = 1200;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        SelectQuestModule,
        RouterTestingModule,
      ],
      providers: [
        QuestHandlerService,
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

    selectService = TestBed.inject(SelectQuestService);

    fixture = TestBed.createComponent(SelectQuestComponent);
    page = new SelectQuestComponentPage(fixture);
    component = fixture.componentInstance;
    fixture.autoDetectChanges(true);
    fixture.detectChanges();
  });

  it('should correctly initialise', waitForAsync(async () => {
    await fixture.whenStable();
      expect(page.createInput.value).toEqual(`${component.customStartingId}`);
      page.expectNewEntityFree();
      expect(querySpy).toHaveBeenCalledWith(
        'SELECT MAX(ID) AS max FROM quest_template;'
      );
      expect(page.queryWrapper.innerText).toContain(
        'SELECT * FROM `quest_template` LIMIT 50'
      );
  }));

  it('should correctly behave when inserting and selecting free id', waitForAsync(async () => {
    await fixture.whenStable();
      querySpy.calls.reset();
      querySpy.and.returnValue(of(
        []
      ));

      page.setInputValue(page.createInput, value);

      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy).toHaveBeenCalledWith(
        `SELECT * FROM \`quest_template\` WHERE (ID = ${value})`
      );
      page.expectNewEntityFree();

      page.clickElement(page.selectNewBtn);

      expect(navigateSpy).toHaveBeenCalledTimes(1);
      expect(navigateSpy).toHaveBeenCalledWith(['quest/quest-template']);
      page.expectTopBarCreatingNew(value);
  }));

  it('should correctly behave when inserting an existing entity', waitForAsync(async () => {
    await fixture.whenStable();
      querySpy.calls.reset();
      querySpy.and.returnValue(of(
        ['mock value']
      ));

      page.setInputValue(page.createInput, value);

      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy).toHaveBeenCalledWith(
        `SELECT * FROM \`quest_template\` WHERE (ID = ${value})`
      );
      page.expectEntityAlreadyInUse();
  }));

  for (const { testId, id, name, limit, expectedQuery } of [
    {
      testId: 1, id: 1200, name: `The People's Militia`, limit: '100', expectedQuery:
        'SELECT * FROM `quest_template` WHERE (`ID` LIKE \'%1200%\') AND (`LogTitle` LIKE \'%The People\\\'s Militia%\') LIMIT 100'
    },
    {
      testId: 2, id: '', name: `The People's Militia`, limit: '100', expectedQuery:
        'SELECT * FROM `quest_template` WHERE (`LogTitle` LIKE \'%The People\\\'s Militia%\') LIMIT 100'
    },
    {
      testId: 3, id: 1200, name: '', limit: '', expectedQuery:
        'SELECT * FROM `quest_template` WHERE (`ID` LIKE \'%1200%\')'
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
    const results: Partial<QuestTemplate>[] = [
      { id: 1, LogTitle: 'An awesome Quest 1', QuestType: 0, QuestLevel: 1, MinLevel: 10, QuestDescription: ''   },
      { id: 2, LogTitle: 'An awesome Quest 2', QuestType: 0, QuestLevel: 2, MinLevel: 20, QuestDescription: ''   },
      { id: 3, LogTitle: 'An awesome Quest 3', QuestType: 0, QuestLevel: 3, MinLevel: 30, QuestDescription: ''   },
    ];
    querySpy.calls.reset();
    querySpy.and.returnValue(of(results));

    page.clickElement(page.searchBtn);

    const row0 = page.getDatatableRowExternal(0);
    const row1 = page.getDatatableRowExternal(1);
    const row2 = page.getDatatableRowExternal(2);

    expect(row0.innerText).toContain(results[0].LogTitle);
    expect(row1.innerText).toContain(results[1].LogTitle);
    expect(row2.innerText).toContain(results[2].LogTitle);

    page.clickElement(page.getDatatableCellExternal(1, 1));

    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(['quest/quest-template']);
    page.expectTopBarEditing(results[1].ID, results[1].LogTitle);
  });
});
