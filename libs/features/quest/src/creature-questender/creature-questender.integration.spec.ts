import { TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { MultiRowEditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { CreatureQuestender } from '@keira/shared/acore-world-model';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { QuestHandlerService } from '../quest-handler.service';
import { QuestPreviewService } from '../quest-preview/quest-preview.service';
import { CreatureQuestenderComponent } from './creature-questender.component';
import { KEIRA_APP_CONFIG_TOKEN, KEIRA_MOCK_CONFIG } from '@keira/shared/config';

class CreatureQuestenderPage extends MultiRowEditorPageObject<CreatureQuestenderComponent> {
  get questPreviewNpcEnd() {
    return this.query(`${this.PREVIEW_CONTAINER_SELECTOR} #npc-end`);
  }
}

describe('CreatureQuestender integration tests', () => {
  const id = 1234;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        ToastrModule.forRoot(),
        ModalModule.forRoot(),
        RouterTestingModule,
        CreatureQuestenderComponent,
        TranslateTestingModule,
      ],
      providers: [{ provide: KEIRA_APP_CONFIG_TOKEN, useValue: KEIRA_MOCK_CONFIG }],
    }).compileComponents();
  }));

  function setup(creatingNew: boolean) {
    const originalRow0 = new CreatureQuestender();
    const originalRow1 = new CreatureQuestender();
    const originalRow2 = new CreatureQuestender();
    originalRow0.quest = originalRow1.quest = originalRow2.quest = id;
    originalRow0.id = 0;
    originalRow1.id = 1;
    originalRow2.id = 2;

    const handlerService = TestBed.inject(QuestHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = spyOn(queryService, 'query').and.returnValue(of([]));
    spyOn(queryService, 'queryValue').and.returnValue(of());

    spyOn(queryService, 'selectAll').and.returnValue(of(creatingNew ? [] : [originalRow0, originalRow1, originalRow2]));
    // by default the other editor services should not be initialised, because the selectAll would return the wrong types for them
    const initializeServicesSpy = spyOn(TestBed.inject(QuestPreviewService), 'initializeServices');
    if (creatingNew) {
      // when creatingNew, the selectAll will return an empty array, so it's fine
      initializeServicesSpy.and.callThrough();
    }

    const fixture = TestBed.createComponent(CreatureQuestenderComponent);
    const component = fixture.componentInstance;
    const page = new CreatureQuestenderPage(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();

    return { handlerService, queryService, querySpy, fixture, component, page };
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
      expect(page.getEditorTableRowsCount()).toBe(0);
      page.removeElement();
    });

    it('should correctly update the unsaved status', () => {
      const { page, handlerService } = setup(true);
      expect(handlerService.isCreatureQuestenderUnsaved).toBe(false);
      page.addNewRow();
      expect(handlerService.isCreatureQuestenderUnsaved).toBe(true);
      page.deleteRow();
      expect(handlerService.isCreatureQuestenderUnsaved).toBe(false);
      page.removeElement();
    });

    it('adding new rows and executing the query should correctly work', () => {
      const { page, querySpy } = setup(true);
      const expectedQuery =
        'DELETE FROM `creature_questender` WHERE (`quest` = 1234) AND (`id` IN (0, 1, 2));\n' +
        'INSERT INTO `creature_questender` (`id`, `quest`) VALUES\n' +
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
      page.expectDiffQueryToContain(expectedQuery);

      page.clickExecuteQuery();
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
      page.removeElement();
    });

    it('adding a row and changing its values should correctly update the queries', () => {
      const { page } = setup(true);
      page.addNewRow();
      page.expectDiffQueryToContain(
        'DELETE FROM `creature_questender` WHERE (`quest` = 1234) AND (`id` IN (0));\n' +
          'INSERT INTO `creature_questender` (`id`, `quest`) VALUES\n' +
          '(0, 1234);',
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_questender` WHERE (`quest` = 1234);\n' +
          'INSERT INTO `creature_questender` (`id`, `quest`) VALUES\n' +
          '(0, 1234);',
      );

      page.setInputValueById('id', '1');
      page.expectDiffQueryToContain(
        'DELETE FROM `creature_questender` WHERE (`quest` = 1234) AND (`id` IN (1));\n' +
          'INSERT INTO `creature_questender` (`id`, `quest`) VALUES\n' +
          '(1, 1234);\n',
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_questender` WHERE (`quest` = 1234);\n' +
          'INSERT INTO `creature_questender` (`id`, `quest`) VALUES\n' +
          '(1, 1234);',
      );
      page.removeElement();
    });

    it('adding a row changing its values and duplicate it should correctly update the queries', () => {
      const { page } = setup(true);
      page.addNewRow();
      page.setInputValueById('id', '1');
      page.duplicateSelectedRow();

      page.expectDiffQueryToContain(
        'DELETE FROM `creature_questender` WHERE (`quest` = 1234) AND (`id` IN (1, 0));\n' +
          'INSERT INTO `creature_questender` (`id`, `quest`) VALUES\n' +
          '(1, 1234),\n' +
          '(0, 1234);\n',
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_questender` WHERE (`quest` = 1234);\n' +
          'INSERT INTO `creature_questender` (`id`, `quest`) VALUES\n' +
          '(1, 1234),\n' +
          '(0, 1234);',
      );
      page.removeElement();
    });

    it('changing a property should be reflected in the quest preview', () => {
      const { page } = setup(true);
      const value = 1234;

      page.addNewRow();
      page.clickRowOfDatatable(0);
      page.setInputValueById('id', value);

      expect(page.questPreviewNpcEnd.innerText).toContain(`[${value}]`);
      page.removeElement();
    });
  });

  describe('Editing existing', () => {
    it('should correctly initialise', () => {
      const { page } = setup(false);
      expect(page.formError.hidden).toBe(true);
      page.expectDiffQueryToBeShown();
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToContain(
        'DELETE FROM `creature_questender` WHERE (`quest` = 1234);\n' +
          'INSERT INTO `creature_questender` (`id`, `quest`) VALUES\n' +
          '(0, 1234),\n' +
          '(1, 1234),\n' +
          '(2, 1234);\n',
      );
      expect(page.getEditorTableRowsCount()).toBe(3);
      page.removeElement();
    });

    it('deleting rows should correctly work', () => {
      const { page } = setup(false);
      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(2);
      page.expectDiffQueryToContain('DELETE FROM `creature_questender` WHERE (`quest` = 1234) AND (`id` IN (1));');
      page.expectFullQueryToContain(
        'DELETE FROM `creature_questender` WHERE (`quest` = 1234);\n' +
          'INSERT INTO `creature_questender` (`id`, `quest`) VALUES\n' +
          '(0, 1234),\n' +
          '(2, 1234);',
      );

      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(1);
      page.expectDiffQueryToContain('DELETE FROM `creature_questender` WHERE (`quest` = 1234) AND (`id` IN (1, 2));');
      page.expectFullQueryToContain(
        'DELETE FROM `creature_questender` WHERE (`quest` = 1234);\n' +
          'INSERT INTO `creature_questender` (`id`, `quest`) VALUES\n' +
          '(0, 1234);',
      );

      page.deleteRow(0);
      expect(page.getEditorTableRowsCount()).toBe(0);
      page.expectDiffQueryToContain('DELETE FROM `creature_questender` WHERE `quest` = 1234;');
      page.expectFullQueryToBeEmpty();
      page.removeElement();
    });

    it('editing existing rows should correctly work', () => {
      const { page } = setup(false);
      page.clickRowOfDatatable(1);
      page.setInputValueById('id', 111);

      page.expectDiffQueryToContain(
        'DELETE FROM `creature_questender` WHERE (`quest` = 1234) AND (`id` IN (1, 111));\n' +
          'INSERT INTO `creature_questender` (`id`, `quest`) VALUES\n' +
          '(111, 1234);\n',
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_questender` WHERE (`quest` = 1234);\n' +
          'INSERT INTO `creature_questender` (`id`, `quest`) VALUES\n' +
          '(0, 1234),\n' +
          '(111, 1234),\n' +
          '(2, 1234);\n',
      );
      page.removeElement();
    });

    it('combining add, edit and delete should correctly work', () => {
      const { page } = setup(false);
      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(4);

      page.clickRowOfDatatable(1);
      page.setInputValueById('id', 10);
      expect(page.getEditorTableRowsCount()).toBe(4);

      page.deleteRow(2);
      expect(page.getEditorTableRowsCount()).toBe(3);

      page.expectDiffQueryToContain(
        'DELETE FROM `creature_questender` WHERE (`quest` = 1234) AND (`id` IN (1, 2, 10, 3));\n' +
          'INSERT INTO `creature_questender` (`id`, `quest`) VALUES\n' +
          '(10, 1234),\n' +
          '(3, 1234);\n',
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_questender` WHERE (`quest` = 1234);\n' +
          'INSERT INTO `creature_questender` (`id`, `quest`) VALUES\n' +
          '(0, 1234),\n' +
          '(10, 1234),\n' +
          '(3, 1234);\n',
      );
      page.removeElement();
    });

    it('using the same row id for multiple rows should correctly show an error', () => {
      const { page } = setup(false);
      page.clickRowOfDatatable(2);
      page.setInputValueById('id', 0);

      page.expectUniqueError();
      page.removeElement();
    });
  });
});
