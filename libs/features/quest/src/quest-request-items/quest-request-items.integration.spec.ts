import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { QuestRequestItems } from '@keira/shared/acore-world-model';
import { KEIRA_APP_CONFIG_TOKEN, KEIRA_MOCK_CONFIG } from '@keira/shared/config';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { Model3DViewerService } from '@keira/shared/model-3d-viewer';
import { EditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalModule } from 'ngx-bootstrap/modal';
import { tickAsync } from 'ngx-page-object-model';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { QuestHandlerService } from '../quest-handler.service';
import { QuestPreviewService } from '../quest-preview/quest-preview.service';
import { QuestRequestItemsComponent } from './quest-request-items.component';

class QuestRequestItemsPage extends EditorPageObject<QuestRequestItemsComponent> {
  get progressText(): HTMLDivElement {
    return this.query<HTMLDivElement>('#progress-text');
  }
}

describe('QuestRequestItems integration tests', () => {
  const id = 1234;
  const expectedFullCreateQuery =
    'DELETE FROM `quest_request_items` WHERE (`ID` = 1234);\n' +
    'INSERT INTO `quest_request_items` (`ID`, `EmoteOnComplete`, `EmoteOnIncomplete`, `CompletionText`, `VerifiedBuild`) VALUES\n' +
    "(1234, 0, 0, '', 0);";

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalModule.forRoot(), RouterTestingModule, QuestRequestItemsComponent, TranslateTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: KEIRA_APP_CONFIG_TOKEN, useValue: KEIRA_MOCK_CONFIG },
        { provide: Model3DViewerService, useValue: { generateModels: () => new Promise((resolve) => resolve({ destroy: () => {} })) } },
      ],
    }).compileComponents();
  });

  function setup(creatingNew: boolean) {
    const originalEntity = new QuestRequestItems();
    originalEntity.ID = id;
    originalEntity.EmoteOnComplete = 2;
    originalEntity.EmoteOnIncomplete = 3;
    originalEntity.CompletionText = '4';

    const handlerService = TestBed.inject(QuestHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = spyOn(queryService, 'query').and.returnValue(of([]));

    spyOn(queryService, 'selectAll').and.returnValue(of(creatingNew ? [] : [originalEntity]));
    // by default the other editor services should not be initialised, because the selectAll would return the wrong types for them
    const initializeServicesSpy = spyOn(TestBed.inject(QuestPreviewService), 'initializeServices');
    if (creatingNew) {
      // when creatingNew, the selectAll will return an empty array, so it's fine
      initializeServicesSpy.and.callThrough();
    }

    const fixture = TestBed.createComponent(QuestRequestItemsComponent);
    const component = fixture.componentInstance;
    const page = new QuestRequestItemsPage(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();

    return { originalEntity, handlerService, queryService, initializeServicesSpy, fixture, component, page, querySpy };
  }

  describe('Creating new', () => {
    it('should correctly initialise', () => {
      const { page } = setup(true);
      page.expectQuerySwitchToBeHidden();
      page.expectFullQueryToBeShown();
      page.expectFullQueryToContain(expectedFullCreateQuery);
      page.removeNativeElement();
    });

    it('should correctly update the unsaved status', () => {
      const { page, handlerService } = setup(true);
      const field = 'EmoteOnComplete';
      expect(handlerService.isQuestRequestItemsUnsaved()).toBe(false);
      page.setInputValueById(field, 3);
      expect(handlerService.isQuestRequestItemsUnsaved()).toBe(true);
      page.setInputValueById(field, 0);
      expect(handlerService.isQuestRequestItemsUnsaved()).toBe(false);
      page.removeNativeElement();
    });

    it('changing a property and executing the query should correctly work', () => {
      const { page, querySpy } = setup(true);
      const expectedQuery =
        'DELETE FROM `quest_request_items` WHERE (`ID` = 1234);\n' +
        'INSERT INTO `quest_request_items` (`ID`, `EmoteOnComplete`, `EmoteOnIncomplete`, `CompletionText`, `VerifiedBuild`) VALUES\n' +
        "(1234, 33, 0, '', 0);";
      querySpy.calls.reset();

      page.setInputValueById('EmoteOnComplete', 33);
      page.expectFullQueryToContain(expectedQuery);

      page.clickExecuteQuery();

      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
      page.removeNativeElement();
    });

    it('changing a property should be reflected in the quest preview', async () => {
      const { page } = setup(true);
      const value = 'Fix all AzerothCore bugs';

      page.setInputValueById('CompletionText', value);
      await tickAsync();

      expect(page.progressText.innerText).toContain(value);
      page.removeNativeElement();
    });
  });

  describe('Editing existing', () => {
    it('should correctly initialise', async () => {
      const { page } = setup(false);
      page.expectDiffQueryToBeShown();
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToContain(
        'DELETE FROM `quest_request_items` WHERE (`ID` = 1234);\n' +
          'INSERT INTO `quest_request_items` (`ID`, `EmoteOnComplete`, `EmoteOnIncomplete`, `CompletionText`, `VerifiedBuild`) VALUES\n' +
          "(1234, 2, 3, '4', 0);",
      );
      page.removeNativeElement();
    });

    it('changing all properties and executing the query should correctly work', () => {
      const { page, querySpy, originalEntity } = setup(false);
      const expectedQuery =
        'UPDATE `quest_request_items` SET ' + "`EmoteOnComplete` = 0, `EmoteOnIncomplete` = 1, `CompletionText` = '2' WHERE (`ID` = 1234);";
      querySpy.calls.reset();

      page.changeAllFields(originalEntity, ['VerifiedBuild']);
      page.expectDiffQueryToContain(expectedQuery);

      page.clickExecuteQuery();
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
      page.removeNativeElement();
    });

    it('changing values should correctly update the queries', async () => {
      const { page } = setup(false);
      page.setInputValueById('EmoteOnComplete', '11');
      page.expectDiffQueryToContain('UPDATE `quest_request_items` SET `EmoteOnComplete` = 11 WHERE (`ID` = 1234);');
      page.expectFullQueryToContain(
        'DELETE FROM `quest_request_items` WHERE (`ID` = 1234);\n' +
          'INSERT INTO `quest_request_items` (`ID`, `EmoteOnComplete`, `EmoteOnIncomplete`, `CompletionText`, `VerifiedBuild`) VALUES\n' +
          "(1234, 11, 3, '4', 0);\n",
      );

      page.setInputValueById('EmoteOnIncomplete', '22');
      page.expectDiffQueryToContain(
        'UPDATE `quest_request_items` SET `EmoteOnComplete` = 11, `EmoteOnIncomplete` = 22 WHERE (`ID` = 1234);',
      );
      page.expectFullQueryToContain(
        'DELETE FROM `quest_request_items` WHERE (`ID` = 1234);\n' +
          'INSERT INTO `quest_request_items` (`ID`, `EmoteOnComplete`, `EmoteOnIncomplete`, `CompletionText`, `VerifiedBuild`) VALUES\n' +
          "(1234, 11, 22, '4', 0);\n",
      );
      page.removeNativeElement();
    });

    xit('changing a value via SingleValueSelector should correctly work', async () => {
      const { page } = setup(false);
      const field = 'EmoteOnComplete';
      page.clickElement(page.getSelectorBtn(field));
      await page.whenReady();
      page.expectModalDisplayed();

      page.clickRowOfDatatableInModal(4);
      await page.whenReady();
      page.clickModalSelect();
      await page.whenReady();

      expect(page.getInputById(field).value).toEqual('4');
      page.expectDiffQueryToContain('UPDATE `quest_request_items` SET `EmoteOnComplete` = 4 WHERE (`ID` = 1234);');
      page.expectFullQueryToContain(
        'DELETE FROM `quest_request_items` WHERE (`ID` = 1234);\n' +
          'INSERT INTO `quest_request_items` (`ID`, `EmoteOnComplete`, `EmoteOnIncomplete`, `CompletionText`, `VerifiedBuild`) VALUES\n' +
          "(1234, 4, 3, '4', 0);\n",
      );
      page.removeNativeElement();
    });
  });
});
