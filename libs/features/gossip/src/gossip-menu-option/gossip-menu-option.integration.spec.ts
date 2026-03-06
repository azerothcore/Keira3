import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';
import { MultiRowEditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { GossipMenuOption } from '@keira/shared/acore-world-model';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { GossipHandlerService } from '../gossip-handler.service';
import { GossipMenuOptionComponent } from './gossip-menu-option.component';
import { instance, mock } from 'ts-mockito';

class GossipMenuOptionPage extends MultiRowEditorPageObject<GossipMenuOptionComponent> {}

describe('GossipMenu integration tests', () => {
  const id = 1234;

  const originalRow0 = new GossipMenuOption();
  const originalRow1 = new GossipMenuOption();
  const originalRow2 = new GossipMenuOption();
  originalRow0.MenuID = originalRow1.MenuID = originalRow2.MenuID = id;
  originalRow0.OptionID = 0;
  originalRow1.OptionID = 1;
  originalRow2.OptionID = 2;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalModule.forRoot(), GossipMenuOptionComponent, RouterTestingModule, TranslateTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        GossipHandlerService,
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
      ],
    }).compileComponents();
  });

  function setup(creatingNew: boolean) {
    const handlerService = TestBed.inject(GossipHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = spyOn(queryService, 'query').and.returnValue(of([]));

    spyOn(queryService, 'selectAll').and.returnValue(of(creatingNew ? [] : [originalRow0, originalRow1, originalRow2]));

    const fixture = TestBed.createComponent(GossipMenuOptionComponent);
    const page = new GossipMenuOptionPage(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();

    return { page, querySpy, handlerService };
  }

  describe('Creating new', () => {
    it('should correctly initialise', () => {
      const { page } = setup(true);
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToBeEmpty();
      expect(page.formError.hidden).toBe(true);
      expect(page.addNewRowBtn.disabled).toBe(false);
      expect(page.deleteSelectedRowBtn.disabled).toBe(true);
      expect(page.getInputById('OptionID').disabled).toBe(true);
      expect(page.getEditorTableRowsCount()).toBe(0);
    });

    it('should correctly update the unsaved status', () => {
      const { page, handlerService } = setup(true);
      expect(handlerService.isGossipMenuOptionTableUnsaved()).toBe(false);
      page.addNewRow();
      expect(handlerService.isGossipMenuOptionTableUnsaved()).toBe(true);
      page.deleteRow();
      expect(handlerService.isGossipMenuOptionTableUnsaved()).toBe(false);
    });

    it('adding new rows and executing the query should correctly work', () => {
      const { page, querySpy } = setup(true);
      const expectedQuery =
        'DELETE FROM `gossip_menu_option` WHERE (`MenuID` = 1234) AND (`OptionID` IN (0, 1, 2));\n' +
        'INSERT INTO `gossip_menu_option` (`MenuID`, `OptionID`, `OptionIcon`, `OptionText`, `OptionBroadcastTextID`, `OptionType`, `OptionNpcFlag`, `ActionMenuID`, `ActionPoiID`, `BoxCoded`, `BoxMoney`, `BoxText`, `BoxBroadcastTextID`, `VerifiedBuild`) VALUES\n' +
        "(1234, 0, 0, '', 0, 0, 0, 0, 0, 0, 0, '', 0, 0),\n" +
        "(1234, 1, 0, '', 0, 0, 0, 0, 0, 0, 0, '', 0, 0),\n" +
        "(1234, 2, 0, '', 0, 0, 0, 0, 0, 0, 0, '', 0, 0);\n";
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
    });

    it('adding a row and changing its values should correctly update the queries', () => {
      const { page } = setup(true);
      page.addNewRow();
      page.expectDiffQueryToContain(
        'DELETE FROM `gossip_menu_option` WHERE (`MenuID` = 1234) AND (`OptionID` IN (0));\n' +
          'INSERT INTO `gossip_menu_option` (`MenuID`, `OptionID`, `OptionIcon`, `OptionText`, `OptionBroadcastTextID`, `OptionType`, `OptionNpcFlag`, `ActionMenuID`, `ActionPoiID`, `BoxCoded`, `BoxMoney`, `BoxText`, `BoxBroadcastTextID`, `VerifiedBuild`) VALUES\n' +
          "(1234, 0, 0, '', 0, 0, 0, 0, 0, 0, 0, '', 0, 0);",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `gossip_menu_option` WHERE (`MenuID` = 1234);\n' +
          'INSERT INTO `gossip_menu_option` (`MenuID`, `OptionID`, `OptionIcon`, `OptionText`, `OptionBroadcastTextID`, `OptionType`, `OptionNpcFlag`, `ActionMenuID`, `ActionPoiID`, `BoxCoded`, `BoxMoney`, `BoxText`, `BoxBroadcastTextID`, `VerifiedBuild`) VALUES\n' +
          "(1234, 0, 0, '', 0, 0, 0, 0, 0, 0, 0, '', 0, 0);",
      );

      page.setInputValueById('OptionID', '123');
      page.expectDiffQueryToContain(
        'DELETE FROM `gossip_menu_option` WHERE (`MenuID` = 1234) AND (`OptionID` IN (123));\n' +
          'INSERT INTO `gossip_menu_option` (`MenuID`, `OptionID`, `OptionIcon`, `OptionText`, `OptionBroadcastTextID`, `OptionType`, `OptionNpcFlag`, `ActionMenuID`, `ActionPoiID`, `BoxCoded`, `BoxMoney`, `BoxText`, `BoxBroadcastTextID`, `VerifiedBuild`) VALUES\n' +
          "(1234, 123, 0, '', 0, 0, 0, 0, 0, 0, 0, '', 0, 0);",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `gossip_menu_option` WHERE (`MenuID` = 1234);\n' +
          'INSERT INTO `gossip_menu_option` (`MenuID`, `OptionID`, `OptionIcon`, `OptionText`, `OptionBroadcastTextID`, `OptionType`, `OptionNpcFlag`, `ActionMenuID`, `ActionPoiID`, `BoxCoded`, `BoxMoney`, `BoxText`, `BoxBroadcastTextID`, `VerifiedBuild`) VALUES\n' +
          "(1234, 123, 0, '', 0, 0, 0, 0, 0, 0, 0, '', 0, 0);",
      );
    });

    it('adding a row changing its values and duplicate it should correctly update the queries', () => {
      const { page } = setup(true);
      page.addNewRow();
      page.setInputValueById('OptionID', '123');
      page.duplicateSelectedRow();

      page.expectDiffQueryToContain(
        'DELETE FROM `gossip_menu_option` WHERE (`MenuID` = 1234) AND (`OptionID` IN (123, 0));\n' +
          'INSERT INTO `gossip_menu_option` (`MenuID`, `OptionID`, `OptionIcon`, `OptionText`, `OptionBroadcastTextID`, `OptionType`, `OptionNpcFlag`, `ActionMenuID`, `ActionPoiID`, `BoxCoded`, `BoxMoney`, `BoxText`, `BoxBroadcastTextID`, `VerifiedBuild`) VALUES\n' +
          "(1234, 123, 0, '', 0, 0, 0, 0, 0, 0, 0, '', 0, 0),\n" +
          "(1234, 0, 0, '', 0, 0, 0, 0, 0, 0, 0, '', 0, 0);",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `gossip_menu_option` WHERE (`MenuID` = 1234);\n' +
          'INSERT INTO `gossip_menu_option` (`MenuID`, `OptionID`, `OptionIcon`, `OptionText`, `OptionBroadcastTextID`, `OptionType`, `OptionNpcFlag`, `ActionMenuID`, `ActionPoiID`, `BoxCoded`, `BoxMoney`, `BoxText`, `BoxBroadcastTextID`, `VerifiedBuild`) VALUES\n' +
          "(1234, 123, 0, '', 0, 0, 0, 0, 0, 0, 0, '', 0, 0),\n" +
          "(1234, 0, 0, '', 0, 0, 0, 0, 0, 0, 0, '', 0, 0);",
      );
    });
  });

  describe('Editing existing', () => {
    it('should correctly initialise', () => {
      const { page } = setup(false);
      expect(page.formError.hidden).toBe(true);
      page.expectDiffQueryToBeShown();
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToContain(
        'DELETE FROM `gossip_menu_option` WHERE (`MenuID` = 1234);\n' +
          'INSERT INTO `gossip_menu_option` (`MenuID`, `OptionID`, `OptionIcon`, `OptionText`, `OptionBroadcastTextID`, `OptionType`, `OptionNpcFlag`, `ActionMenuID`, `ActionPoiID`, `BoxCoded`, `BoxMoney`, `BoxText`, `BoxBroadcastTextID`, `VerifiedBuild`) VALUES\n' +
          "(1234, 0, 0, '', 0, 0, 0, 0, 0, 0, 0, '', 0, 0),\n" +
          "(1234, 1, 0, '', 0, 0, 0, 0, 0, 0, 0, '', 0, 0),\n" +
          "(1234, 2, 0, '', 0, 0, 0, 0, 0, 0, 0, '', 0, 0);",
      );
      expect(page.getEditorTableRowsCount()).toBe(3);
    });

    it('deleting rows should correctly work', () => {
      const { page } = setup(false);
      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(2);
      page.expectDiffQueryToContain('DELETE FROM `gossip_menu_option` WHERE (`MenuID` = 1234) AND (`OptionID` IN (1));');
      page.expectFullQueryToContain(
        'DELETE FROM `gossip_menu_option` WHERE (`MenuID` = 1234);\n' +
          'INSERT INTO `gossip_menu_option` (`MenuID`, `OptionID`, `OptionIcon`, `OptionText`, `OptionBroadcastTextID`, `OptionType`, `OptionNpcFlag`, `ActionMenuID`, `ActionPoiID`, `BoxCoded`, `BoxMoney`, `BoxText`, `BoxBroadcastTextID`, `VerifiedBuild`) VALUES\n' +
          "(1234, 0, 0, '', 0, 0, 0, 0, 0, 0, 0, '', 0, 0),\n" +
          "(1234, 2, 0, '', 0, 0, 0, 0, 0, 0, 0, '', 0, 0);\n",
      );

      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(1);
      page.expectDiffQueryToContain('DELETE FROM `gossip_menu_option` WHERE (`MenuID` = 1234) AND (`OptionID` IN (1, 2));');
      page.expectFullQueryToContain(
        'DELETE FROM `gossip_menu_option` WHERE (`MenuID` = 1234);\n' +
          'INSERT INTO `gossip_menu_option` (`MenuID`, `OptionID`, `OptionIcon`, `OptionText`, `OptionBroadcastTextID`, `OptionType`, `OptionNpcFlag`, `ActionMenuID`, `ActionPoiID`, `BoxCoded`, `BoxMoney`, `BoxText`, `BoxBroadcastTextID`, `VerifiedBuild`) VALUES\n' +
          "(1234, 0, 0, '', 0, 0, 0, 0, 0, 0, 0, '', 0, 0);\n",
      );

      page.deleteRow(0);
      expect(page.getEditorTableRowsCount()).toBe(0);
      page.expectDiffQueryToContain('DELETE FROM `gossip_menu_option` WHERE `MenuID` = 1234;');
      page.expectFullQueryToBeEmpty();
    });

    it('editing existing rows should correctly work', () => {
      const { page } = setup(false);
      page.clickRowOfDatatable(1);
      page.setInputValueById('OptionID', 123);

      page.expectDiffQueryToContain(
        'DELETE FROM `gossip_menu_option` WHERE (`MenuID` = 1234) AND (`OptionID` IN (1, 123));\n' +
          'INSERT INTO `gossip_menu_option` (`MenuID`, `OptionID`, `OptionIcon`, `OptionText`, `OptionBroadcastTextID`, `OptionType`, `OptionNpcFlag`, `ActionMenuID`, `ActionPoiID`, `BoxCoded`, `BoxMoney`, `BoxText`, `BoxBroadcastTextID`, `VerifiedBuild`) VALUES\n' +
          "(1234, 123, 0, '', 0, 0, 0, 0, 0, 0, 0, '', 0, 0);",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `gossip_menu_option` WHERE (`MenuID` = 1234);\n' +
          'INSERT INTO `gossip_menu_option` (`MenuID`, `OptionID`, `OptionIcon`, `OptionText`, `OptionBroadcastTextID`, `OptionType`, `OptionNpcFlag`, `ActionMenuID`, `ActionPoiID`, `BoxCoded`, `BoxMoney`, `BoxText`, `BoxBroadcastTextID`, `VerifiedBuild`) VALUES\n' +
          "(1234, 0, 0, '', 0, 0, 0, 0, 0, 0, 0, '', 0, 0),\n" +
          "(1234, 123, 0, '', 0, 0, 0, 0, 0, 0, 0, '', 0, 0),\n" +
          "(1234, 2, 0, '', 0, 0, 0, 0, 0, 0, 0, '', 0, 0);\n",
      );
    });

    it('combining add, edit and delete should correctly work', () => {
      const { page } = setup(false);
      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(4);

      page.clickRowOfDatatable(1);
      page.setInputValueById('OptionID', 10);
      expect(page.getEditorTableRowsCount()).toBe(4);

      page.deleteRow(2);
      expect(page.getEditorTableRowsCount()).toBe(3);

      page.expectDiffQueryToContain(
        'DELETE FROM `gossip_menu_option` WHERE (`MenuID` = 1234) AND (`OptionID` IN (1, 2, 10, 3));\n' +
          'INSERT INTO `gossip_menu_option` (`MenuID`, `OptionID`, `OptionIcon`, `OptionText`, `OptionBroadcastTextID`, `OptionType`, `OptionNpcFlag`, `ActionMenuID`, `ActionPoiID`, `BoxCoded`, `BoxMoney`, `BoxText`, `BoxBroadcastTextID`, `VerifiedBuild`) VALUES\n' +
          "(1234, 10, 0, '', 0, 0, 0, 0, 0, 0, 0, '', 0, 0),\n" +
          "(1234, 3, 0, '', 0, 0, 0, 0, 0, 0, 0, '', 0, 0);",
      );
      page.expectFullQueryToContain(
        'DELETE FROM `gossip_menu_option` WHERE (`MenuID` = 1234);\n' +
          'INSERT INTO `gossip_menu_option` (`MenuID`, `OptionID`, `OptionIcon`, `OptionText`, `OptionBroadcastTextID`, `OptionType`, `OptionNpcFlag`, `ActionMenuID`, `ActionPoiID`, `BoxCoded`, `BoxMoney`, `BoxText`, `BoxBroadcastTextID`, `VerifiedBuild`) VALUES\n' +
          "(1234, 0, 0, '', 0, 0, 0, 0, 0, 0, 0, '', 0, 0),\n" +
          "(1234, 10, 0, '', 0, 0, 0, 0, 0, 0, 0, '', 0, 0),\n" +
          "(1234, 3, 0, '', 0, 0, 0, 0, 0, 0, 0, '', 0, 0);\n",
      );
    });

    it('using the same row id for multiple rows should correctly show an error', () => {
      const { page } = setup(false);
      page.clickRowOfDatatable(2);
      page.setInputValueById('OptionID', 0);

      page.expectUniqueError();
    });
  });
});
