import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import Spy = jasmine.Spy;

import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { QuestRequestItemsComponent } from './quest-request-items.component';
import { EditorPageObject } from '@keira-testing/editor-page-object';
import { QuestRequestItems } from '@keira-types/quest-request-items.type';
import { QuestHandlerService } from '../quest-handler.service';
import { QuestModule } from '../quest.module';
import { QuestPreviewService } from '../quest-preview/quest-preview.service';

class QuestRequestItemsPage extends EditorPageObject<QuestRequestItemsComponent> {}

describe('QuestRequestItems integration tests', () => {
  let component: QuestRequestItemsComponent;
  let fixture: ComponentFixture<QuestRequestItemsComponent>;
  let queryService: MysqlQueryService;
  let querySpy: Spy;
  let handlerService: QuestHandlerService;
  let page: QuestRequestItemsPage;

  const id = 1234;
  const expectedFullCreateQuery = 'DELETE FROM `quest_request_items` WHERE (`ID` = 1234);\n' +
    'INSERT INTO `quest_request_items` (`ID`, `EmoteOnComplete`, `EmoteOnIncomplete`, `CompletionText`, `VerifiedBuild`) VALUES\n' +
    '(1234, 0, 0, \'\', 0);';

  const originalEntity = new QuestRequestItems();
  originalEntity.ID = id;
  originalEntity.EmoteOnComplete = 2;
  originalEntity.EmoteOnIncomplete = 3;
  originalEntity.CompletionText = '4';


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        QuestModule,
      ],
    })
      .compileComponents();
  }));

  function setup(creatingNew: boolean) {
    handlerService = TestBed.inject(QuestHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    queryService = TestBed.inject(MysqlQueryService);
    querySpy = spyOn(queryService, 'query').and.returnValue(of());

    spyOn(queryService, 'selectAll').and.returnValue(of(
      creatingNew ? [] : [originalEntity]
    ));
    // by default the other editor services should not be initialised, because the selectAll would return the wrong types for them
    const initializeServicesSpy = spyOn(TestBed.inject(QuestPreviewService), 'initializeServices');
    if (creatingNew) {
      // when creatingNew, the selectAll will return an empty array, so it's fine
      initializeServicesSpy.and.callThrough();
    }

    fixture = TestBed.createComponent(QuestRequestItemsComponent);
    component = fixture.componentInstance;
    page = new QuestRequestItemsPage(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();
  }

  describe('Creating new', () => {
    beforeEach(() => setup(true));

    it('should correctly initialise', () => {
      page.expectQuerySwitchToBeHidden();
      page.expectFullQueryToBeShown();
      page.expectFullQueryToContain(expectedFullCreateQuery);
    });

    it('should correctly update the unsaved status', () => {
      const field = 'EmoteOnComplete';
      expect(handlerService.isQuestRequestItemsUnsaved).toBe(false);
      page.setInputValueById(field, 3);
      expect(handlerService.isQuestRequestItemsUnsaved).toBe(true);
      page.setInputValueById(field, 0);
      expect(handlerService.isQuestRequestItemsUnsaved).toBe(false);
    });

    it('changing a property and executing the query should correctly work', () => {
      const expectedQuery = 'DELETE FROM `quest_request_items` WHERE (`ID` = 1234);\n' +
        'INSERT INTO `quest_request_items` (`ID`, `EmoteOnComplete`, `EmoteOnIncomplete`, `CompletionText`, `VerifiedBuild`) VALUES\n' +
        '(1234, 33, 0, \'\', 0);';
      querySpy.calls.reset();

      page.setInputValueById('EmoteOnComplete', 33);
      page.clickExecuteQuery();

      page.expectFullQueryToContain(expectedQuery);
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
    });
  });

  describe('Editing existing', () => {
    beforeEach(() => setup(false));

    it('should correctly initialise', async () => {
      page.expectDiffQueryToBeShown();
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToContain('DELETE FROM `quest_request_items` WHERE (`ID` = 1234);\n' +
        'INSERT INTO `quest_request_items` (`ID`, `EmoteOnComplete`, `EmoteOnIncomplete`, `CompletionText`, `VerifiedBuild`) VALUES\n' +
        '(1234, 2, 3, \'4\', 0);');
    });

    it('changing all properties and executing the query should correctly work', () => {
      const expectedQuery = 'UPDATE `quest_request_items` SET ' +
        '`EmoteOnComplete` = 0, `EmoteOnIncomplete` = 1, `CompletionText` = \'2\' WHERE (`ID` = 1234);';
      querySpy.calls.reset();

      page.changeAllFields(originalEntity, ['VerifiedBuild']);
      page.clickExecuteQuery();

      page.expectDiffQueryToContain(expectedQuery);
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
    });

    it('changing values should correctly update the queries', async () => {
      page.setInputValueById('EmoteOnComplete', '11');
      page.expectDiffQueryToContain(
        'UPDATE `quest_request_items` SET `EmoteOnComplete` = 11 WHERE (`ID` = 1234);'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `quest_request_items` WHERE (`ID` = 1234);\n' +
        'INSERT INTO `quest_request_items` (`ID`, `EmoteOnComplete`, `EmoteOnIncomplete`, `CompletionText`, `VerifiedBuild`) VALUES\n' +
        '(1234, 11, 3, \'4\', 0);\n'
      );

      page.setInputValueById('EmoteOnIncomplete', '22');
      page.expectDiffQueryToContain(
        'UPDATE `quest_request_items` SET `EmoteOnComplete` = 11, `EmoteOnIncomplete` = 22 WHERE (`ID` = 1234);'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `quest_request_items` WHERE (`ID` = 1234);\n' +
        'INSERT INTO `quest_request_items` (`ID`, `EmoteOnComplete`, `EmoteOnIncomplete`, `CompletionText`, `VerifiedBuild`) VALUES\n' +
        '(1234, 11, 22, \'4\', 0);\n'
      );
    });

    it('changing a value via SingleValueSelector should correctly work', async () => {
      const field = 'EmoteOnComplete';
      page.clickElement(page.getSelectorBtn(field));
      await page.whenReady();
      page.expectModalDisplayed();

      page.clickRowOfDatatableInModal(4);
      await page.whenReady();
      page.clickModalSelect();
      await page.whenReady();

      expect(page.getInputById(field).value).toEqual('4');
      page.expectDiffQueryToContain(
        'UPDATE `quest_request_items` SET `EmoteOnComplete` = 4 WHERE (`ID` = 1234);'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `quest_request_items` WHERE (`ID` = 1234);\n' +
        'INSERT INTO `quest_request_items` (`ID`, `EmoteOnComplete`, `EmoteOnIncomplete`, `CompletionText`, `VerifiedBuild`) VALUES\n' +
        '(1234, 4, 3, \'4\', 0);\n'
      );
    });
  });
});
