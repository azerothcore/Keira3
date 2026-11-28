import { vi } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { QuestOfferRewardLocale } from '@keira/shared/acore-world-model';
import { KEIRA_APP_CONFIG_TOKEN, KEIRA_MOCK_CONFIG } from '@keira/shared/config';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { Model3DViewerService } from '@keira/shared/model-3d-viewer';
import { MultiRowEditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { QuestHandlerService } from '../quest-handler.service';
import { QuestPreviewService } from '../quest-preview/quest-preview.service';
import { QuestOfferRewardLocaleComponent } from './quest-offer-reward-locale.component';

class QuestOfferRewardLocalePage extends MultiRowEditorPageObject<QuestOfferRewardLocaleComponent> {}

describe('QuestOfferRewardLocale integration tests', () => {
  const id = 1234;
  const insertHeader = 'INSERT INTO `quest_offer_reward_locale` (`ID`, `locale`, `RewardText`, `VerifiedBuild`) VALUES\n';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalDirective, QuestOfferRewardLocaleComponent, TranslateTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        QuestHandlerService,
        { provide: KEIRA_APP_CONFIG_TOKEN, useValue: KEIRA_MOCK_CONFIG },
        { provide: Model3DViewerService, useValue: { generateModels: () => new Promise((resolve) => resolve({ destroy: () => {} })) } },
      ],
    }).compileComponents();
  });

  function setup(creatingNew: boolean) {
    const originalRow = new QuestOfferRewardLocale();
    originalRow.ID = id;
    originalRow.locale = 'deDE';
    originalRow.RewardText = 'Gut gemacht';

    const handlerService = TestBed.inject(QuestHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = vi.spyOn(queryService, 'query').mockReturnValue(of([]));
    vi.spyOn(queryService, 'queryValue').mockReturnValue(of());

    vi.spyOn(queryService, 'selectAll').mockReturnValue(of(creatingNew ? [] : [originalRow]));
    const initializeServicesSpy = vi.spyOn(TestBed.inject(QuestPreviewService), 'initializeServices').mockImplementation(() => undefined);
    if (creatingNew) {
      initializeServicesSpy.mockRestore();
    }

    const fixture = TestBed.createComponent(QuestOfferRewardLocaleComponent);
    const page = new QuestOfferRewardLocalePage(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();

    return { handlerService, queryService, querySpy, page };
  }

  describe('Creating new', () => {
    it('should correctly initialise', () => {
      const { page } = setup(true);
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToBeEmpty();
      expect(page.formError.hidden).toBe(true);
      expect(page.addNewRowBtn.disabled).toBe(false);
      expect(page.deleteSelectedRowBtn.disabled).toBe(true);
      expect(page.getInputById('id').disabled).toBe(true);
      expect(page.getInputById('reward-text').disabled).toBe(true);
      expect(page.getEditorTableRowsCount()).toBe(0);
    });

    it('should correctly update the unsaved status', () => {
      const { page, handlerService } = setup(true);
      expect(handlerService.isQuestOfferRewardLocaleUnsaved()).toBe(false);
      page.addNewRow();
      expect(handlerService.isQuestOfferRewardLocaleUnsaved()).toBe(true);
      page.deleteRow();
      expect(handlerService.isQuestOfferRewardLocaleUnsaved()).toBe(false);
    });

    it('adding new rows and executing the query should correctly work', () => {
      const { page, querySpy } = setup(true);
      const expectedQuery =
        "DELETE FROM `quest_offer_reward_locale` WHERE (`ID` = 1234) AND (`locale` IN ('0', '1', '2'));\n" +
        insertHeader +
        "(1234, '0', '', 0),\n" +
        "(1234, '1', '', 0),\n" +
        "(1234, '2', '', 0);";
      querySpy.mockClear();

      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(1);
      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(2);
      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(3);
      page.expectDiffQueryToContain(expectedQuery);

      page.clickExecuteQuery();
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.mock.calls.at(-1)[0]).toContain(expectedQuery);
    });

    it('adding a row and changing its values should correctly update the queries', () => {
      const { page } = setup(true);
      page.addNewRow();
      page.setInputValueById('reward-text', 'Bien hecho');

      const locale = page.getDebugElementByCss<HTMLSelectElement>('#locale select').nativeElement;
      page.setInputValue(locale, '1: esES');

      page.expectDiffQueryToContain(
        "DELETE FROM `quest_offer_reward_locale` WHERE (`ID` = 1234) AND (`locale` IN ('esES'));\n" +
          insertHeader +
          "(1234, 'esES', 'Bien hecho', 0);",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `quest_offer_reward_locale` WHERE (`ID` = 1234);\n' + insertHeader + "(1234, 'esES', 'Bien hecho', 0);",
      );
    });

    it('adding a row changing its values and duplicate it should correctly update the queries', () => {
      const { page } = setup(true);
      page.addNewRow();
      page.setInputValueById('reward-text', 'Bravo');

      const locale = page.getDebugElementByCss<HTMLSelectElement>('#locale select').nativeElement;
      page.setInputValue(locale, '3: frFR');

      page.duplicateSelectedRow();

      page.expectDiffQueryToContain(
        "DELETE FROM `quest_offer_reward_locale` WHERE (`ID` = 1234) AND (`locale` IN ('frFR', '0'));\n" +
          insertHeader +
          "(1234, 'frFR', 'Bravo', 0),\n" +
          "(1234, '0', 'Bravo', 0);",
      );
    });
  });

  describe('Editing existing', () => {
    it('should correctly initialise', () => {
      const { page } = setup(false);
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToContain(
        'DELETE FROM `quest_offer_reward_locale` WHERE (`ID` = 1234);\n' + insertHeader + "(1234, 'deDE', 'Gut gemacht', 0);",
      );
      expect(page.getEditorTableRowsCount()).toBe(1);
    });

    it('editing the text of an existing row should correctly update the queries', () => {
      const { page, querySpy } = setup(false);
      const expectedQuery =
        "DELETE FROM `quest_offer_reward_locale` WHERE (`ID` = 1234) AND (`locale` IN ('deDE'));\n" +
        insertHeader +
        "(1234, 'deDE', 'Sehr gut gemacht', 0);";
      querySpy.mockClear();

      page.clickRowOfDatatable(0);
      page.setInputValueById('reward-text', 'Sehr gut gemacht');
      page.expectDiffQueryToContain(expectedQuery);

      page.clickExecuteQuery();
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.mock.calls.at(-1)[0]).toContain(expectedQuery);
    });

    it('deleting the existing row should correctly update the queries', () => {
      const { page } = setup(false);
      page.clickRowOfDatatable(0);
      page.deleteRow();
      expect(page.getEditorTableRowsCount()).toBe(0);
      page.expectDiffQueryToContain('DELETE FROM `quest_offer_reward_locale` WHERE `ID` = 1234;');
      page.expectFullQueryToBeEmpty();
    });
  });
});
