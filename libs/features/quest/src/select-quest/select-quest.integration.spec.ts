import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { SelectPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { QuestTemplate } from '@keira/shared/acore-world-model';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { QuestHandlerService } from '../quest-handler.service';
import { SelectQuestComponent } from './select-quest.component';

class SelectQuestComponentPage extends SelectPageObject<SelectQuestComponent> {
  override ID_FIELD = 'ID';
}

describe('SelectQuest integration tests', () => {
  const value = 1200;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalModule.forRoot(), RouterTestingModule, TranslateTestingModule],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations(), QuestHandlerService],
    }).compileComponents();
  });

  function setup() {
    const navigateSpy = spyOn(TestBed.inject(Router), 'navigate');
    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = spyOn(queryService, 'query').and.returnValue(of([{ max: 1 }]));

    const fixture = TestBed.createComponent(SelectQuestComponent);
    const page = new SelectQuestComponentPage(fixture);
    const component = fixture.componentInstance;
    fixture.autoDetectChanges(true);
    fixture.detectChanges();

    return { fixture, page, component, querySpy, navigateSpy };
  }

  it('should correctly initialise', async () => {
    const { fixture, page, component, querySpy } = setup();
    await fixture.whenStable();
    expect(page.createInput.value).toEqual(`${component.customStartingId}`);
    page.expectNewEntityFree();
    expect(querySpy).toHaveBeenCalledWith('SELECT MAX(ID) AS max FROM quest_template;');
    expect(page.queryWrapper.innerText).toContain('SELECT * FROM `quest_template` LIMIT 50');
  });

  it('should correctly behave when inserting and selecting free id', async () => {
    const { fixture, page, querySpy, navigateSpy } = setup();
    await fixture.whenStable();
    querySpy.calls.reset();
    querySpy.and.returnValue(of([]));

    page.setInputValue(page.createInput, value);

    expect(querySpy).toHaveBeenCalledTimes(1);
    expect(querySpy).toHaveBeenCalledWith(`SELECT * FROM \`quest_template\` WHERE (ID = ${value})`);
    page.expectNewEntityFree();

    page.clickElement(page.selectNewBtn);

    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(['quest/quest-template']);
    page.expectTopBarCreatingNew(value);
  });

  it('should correctly behave when inserting an existing entity', async () => {
    const { fixture, page, querySpy } = setup();
    await fixture.whenStable();
    querySpy.calls.reset();
    querySpy.and.returnValue(of(['mock value'] as any));

    page.setInputValue(page.createInput, value);

    expect(querySpy).toHaveBeenCalledTimes(1);
    expect(querySpy).toHaveBeenCalledWith(`SELECT * FROM \`quest_template\` WHERE (ID = ${value})`);
    page.expectEntityAlreadyInUse();
  });

  for (const { testId, id, name, limit, expectedQuery } of [
    {
      testId: 1,
      id: 1200,
      name: `The People's Militia`,
      limit: '100',
      expectedQuery: "SELECT * FROM `quest_template` WHERE (`ID` LIKE '%1200%') AND (`LogTitle` LIKE '%The People\\'s Militia%') LIMIT 100",
    },
    {
      testId: 2,
      id: '',
      name: `The People's Militia`,
      limit: '100',
      expectedQuery: "SELECT * FROM `quest_template` WHERE (`LogTitle` LIKE '%The People\\'s Militia%') LIMIT 100",
    },
    {
      testId: 3,
      id: 1200,
      name: '',
      limit: '',
      expectedQuery: "SELECT * FROM `quest_template` WHERE (`ID` LIKE '%1200%')",
    },
  ]) {
    it(`searching an existing entity should correctly work [${testId}]`, () => {
      const { page, querySpy } = setup();
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
    const { page, querySpy, navigateSpy } = setup();
    const results: Partial<QuestTemplate>[] = [
      { id: 1, LogTitle: 'An awesome Quest 1', QuestType: 0, QuestLevel: 1, MinLevel: 10, QuestDescription: '' },
      { id: 2, LogTitle: 'An awesome Quest 2', QuestType: 0, QuestLevel: 2, MinLevel: 20, QuestDescription: '' },
      { id: 3, LogTitle: 'An awesome Quest 3', QuestType: 0, QuestLevel: 3, MinLevel: 30, QuestDescription: '' },
    ];
    querySpy.calls.reset();
    querySpy.and.returnValue(of(results as any));

    page.clickElement(page.searchBtn);

    const row0 = page.getDatatableRowExternal(0);
    const row1 = page.getDatatableRowExternal(1);
    const row2 = page.getDatatableRowExternal(2);

    expect(row0.innerText).toContain(results[0].LogTitle as string);
    expect(row1.innerText).toContain(results[1].LogTitle as string);
    expect(row2.innerText).toContain(results[2].LogTitle as string);

    page.clickElement(page.getDatatableCellExternal(1, 1));

    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(['quest/quest-template']);
    page.expectTopBarEditing(results[1].ID as number, results[1].LogTitle as string);
  });
});
