import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import Spy = jasmine.Spy;

import { QueryService } from '../../../../services/query.service';
import { QuestRequestItemsComponent } from './quest-request-items.component';
import { QuestRequestItemsModule } from './quest-request-items.module';
import { EditorPageObject } from '../../../../test-utils/editor-page-object';
import { CreatureHandlerService } from '../../../../services/handlers/creature-handler.service';
import { QuestRequestItems } from '../../../../types/quest-request-items.type';
import { QuestHandlerService } from '../../../../services/handlers/quest-handler.service';

class QuestRequestItemsPage extends EditorPageObject<QuestRequestItemsComponent> {}

describe('QuestRequestItems integration tests', () => {
  let component: QuestRequestItemsComponent;
  let fixture: ComponentFixture<QuestRequestItemsComponent>;
  let queryService: QueryService;
  let querySpy: Spy;
  let handlerService: CreatureHandlerService;
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
        QuestRequestItemsModule,
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
      { results: creatingNew ? [] : [originalEntity] }
    ));

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

    it('should correctly initialise', () => {
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

    it('changing values should correctly update the queries', () => {
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

    it('changing a value via SingleValueSelector should correctly work', () => {
      const field = 'EmoteOnComplete';
      page.clickElement(page.getSelectorBtn(field));
      page.expectModalDisplayed();

      page.clickRowOfDatatable(4);
      page.clickModalSelect();

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
