import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import Spy = jasmine.Spy;

import { GameobjectQuestenderComponent } from './gameobject-questender.component';
import { GameobjectQuestenderModule } from './gameobject-questender.module';
import { QueryService } from '../../../shared/services/query.service';
import { GameobjectQuestender } from '../../../shared/types/gameobject-questender.type';
import { MultiRowEditorPageObject } from '../../../shared/testing/multi-row-editor-page-object';
import { QuestHandlerService } from '../quest-handler.service';

class GameobjectQuestenderPage extends MultiRowEditorPageObject<GameobjectQuestenderComponent> {}

describe('GameobjectQuestender integration tests', () => {
  let component: GameobjectQuestenderComponent;
  let fixture: ComponentFixture<GameobjectQuestenderComponent>;
  let queryService: QueryService;
  let querySpy: Spy;
  let handlerService: QuestHandlerService;
  let page: GameobjectQuestenderPage;

  const id = 1234;

  const originalRow0 = new GameobjectQuestender();
  const originalRow1 = new GameobjectQuestender();
  const originalRow2 = new GameobjectQuestender();
  originalRow0.quest = originalRow1.quest = originalRow2.quest = id;
  originalRow0.id = 0;
  originalRow1.id = 1;
  originalRow2.id = 2;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        GameobjectQuestenderModule,
        RouterTestingModule,
      ],
    })
      .compileComponents();
  }));

  function setup(creatingNew: boolean) {
    handlerService = TestBed.get(QuestHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    queryService = TestBed.get(QueryService);
    querySpy = spyOn(queryService, 'query').and.returnValue(of());

    spyOn(queryService, 'selectAll').and.returnValue(of(
      { results: creatingNew ? [] : [originalRow0, originalRow1, originalRow2] }
    ));

    fixture = TestBed.createComponent(GameobjectQuestenderComponent);
    component = fixture.componentInstance;
    page = new GameobjectQuestenderPage(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();
  }

  describe('Creating new', () => {
    beforeEach(() => setup(true));


    it('should correctly initialise', () => {
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToBeEmpty();
      expect(page.formError.hidden).toBe(true);
      expect(page.addNewRowBtn.disabled).toBe(false);
      expect(page.deleteSelectedRowBtn.disabled).toBe(true);
      expect(page.getInputById('id').disabled).toBe(true);
      expect(page.getEditorTableRowsCount()).toBe(0);
    });

    it('adding new rows and executing the query should correctly work', () => {
      const expectedQuery = 'DELETE FROM `gameobject_questender` WHERE (`quest` = 1234) AND (`id` IN (0, 1, 2));\n' +
        'INSERT INTO `gameobject_questender` (`id`, `quest`) VALUES\n' +
        '(0, 1234),\n' +
        '(1, 1234),\n' +
        '(2, 1234);\n';
      querySpy.calls.reset();

      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(1);
      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(2);
      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(3);
      page.clickExecuteQuery();

      page.expectDiffQueryToContain(expectedQuery);
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
    });

    it('adding a row and changing its values should correctly update the queries', () => {
      page.addNewRow();
      page.expectDiffQueryToContain(
        'DELETE FROM `gameobject_questender` WHERE (`quest` = 1234) AND (`id` IN (0));\n' +
        'INSERT INTO `gameobject_questender` (`id`, `quest`) VALUES\n' +
        '(0, 1234);'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `gameobject_questender` WHERE (`quest` = 1234);\n' +
        'INSERT INTO `gameobject_questender` (`id`, `quest`) VALUES\n' +
        '(0, 1234);'
      );

      page.setInputValueById('id', '1');
      page.expectDiffQueryToContain(
        'DELETE FROM `gameobject_questender` WHERE (`quest` = 1234) AND (`id` IN (1));\n' +
        'INSERT INTO `gameobject_questender` (`id`, `quest`) VALUES\n' +
        '(1, 1234);\n'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `gameobject_questender` WHERE (`quest` = 1234);\n' +
        'INSERT INTO `gameobject_questender` (`id`, `quest`) VALUES\n' +
        '(1, 1234);'
      );
    });
  });

  describe('Editing existing', () => {
    beforeEach(() => setup(false));

    it('should correctly initialise', () => {
      expect(page.formError.hidden).toBe(true);
      page.expectDiffQueryToBeShown();
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToContain('DELETE FROM `gameobject_questender` WHERE (`quest` = 1234);\n' +
        'INSERT INTO `gameobject_questender` (`id`, `quest`) VALUES\n' +
        '(0, 1234),\n' +
        '(1, 1234),\n' +
        '(2, 1234);\n');
      expect(page.getEditorTableRowsCount()).toBe(3);
    });

    it('deleting rows should correctly work', () => {
      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(2);
      page.expectDiffQueryToContain(
        'DELETE FROM `gameobject_questender` WHERE (`quest` = 1234) AND (`id` IN (1));'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `gameobject_questender` WHERE (`quest` = 1234);\n' +
        'INSERT INTO `gameobject_questender` (`id`, `quest`) VALUES\n' +
        '(0, 1234),\n' +
        '(2, 1234);'
      );

      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(1);
      page.expectDiffQueryToContain(
        'DELETE FROM `gameobject_questender` WHERE (`quest` = 1234) AND (`id` IN (1, 2));'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `gameobject_questender` WHERE (`quest` = 1234);\n' +
        'INSERT INTO `gameobject_questender` (`id`, `quest`) VALUES\n' +
        '(0, 1234);'
      );

      page.deleteRow(0);
      expect(page.getEditorTableRowsCount()).toBe(0);
      page.expectDiffQueryToContain(
        'DELETE FROM `gameobject_questender` WHERE `quest` = 1234;'
      );
      page.expectFullQueryToBeEmpty();
    });

    it('editing existing rows should correctly work', () => {
      page.clickRowOfDatatable(1);
      page.setInputValueById('id', 111);

      page.expectDiffQueryToContain(
        'DELETE FROM `gameobject_questender` WHERE (`quest` = 1234) AND (`id` IN (1, 111));\n' +
        'INSERT INTO `gameobject_questender` (`id`, `quest`) VALUES\n' +
        '(111, 1234);\n'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `gameobject_questender` WHERE (`quest` = 1234);\n' +
        'INSERT INTO `gameobject_questender` (`id`, `quest`) VALUES\n' +
        '(0, 1234),\n' +
        '(111, 1234),\n' +
        '(2, 1234);\n'
      );
    });

    it('combining add, edit and delete should correctly work', () => {
      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(4);

      page.clickRowOfDatatable(1);
      page.setInputValueById('id', 10);
      expect(page.getEditorTableRowsCount()).toBe(4);

      page.deleteRow(2);
      expect(page.getEditorTableRowsCount()).toBe(3);

      page.expectDiffQueryToContain(
        'DELETE FROM `gameobject_questender` WHERE (`quest` = 1234) AND (`id` IN (1, 2, 10, 3));\n' +
        'INSERT INTO `gameobject_questender` (`id`, `quest`) VALUES\n' +
        '(10, 1234),\n' +
        '(3, 1234);\n'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `gameobject_questender` WHERE (`quest` = 1234);\n' +
        'INSERT INTO `gameobject_questender` (`id`, `quest`) VALUES\n' +
        '(0, 1234),\n' +
        '(10, 1234),\n' +
        '(3, 1234);\n'
      );
    });

    it('using the same row id for multiple rows should correctly show an error', () => {
      page.clickRowOfDatatable(2);
      page.setInputValueById('id', 0);

      page.expectUniqueError();
    });
  });
});

