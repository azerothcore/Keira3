import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService } from '@keira-shared/services/query/mysql-query.service';
import { MultiRowEditorPageObject } from '@keira-testing/multi-row-editor-page-object';
import { GossipMenuOption } from '@keira/acore-world-model';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { GossipHandlerService } from '../gossip-handler.service';
import { GossipMenuOptionComponent } from './gossip-menu-option.component';
import { GossipMenuOptionModule } from './gossip-menu-option.module';
import { TranslateTestingModule } from '@keira-shared/testing/translate-module';
import Spy = jasmine.Spy;

class GossipMenuOptionPage extends MultiRowEditorPageObject<GossipMenuOptionComponent> {}

describe('GossipMenu integration tests', () => {
  let fixture: ComponentFixture<GossipMenuOptionComponent>;
  let queryService: MysqlQueryService;
  let querySpy: Spy;
  let handlerService: GossipHandlerService;
  let page: GossipMenuOptionPage;

  const id = 1234;

  const originalRow0 = new GossipMenuOption();
  const originalRow1 = new GossipMenuOption();
  const originalRow2 = new GossipMenuOption();
  originalRow0.MenuID = originalRow1.MenuID = originalRow2.MenuID = id;
  originalRow0.OptionID = 0;
  originalRow1.OptionID = 1;
  originalRow2.OptionID = 2;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalModule.forRoot(), GossipMenuOptionModule, RouterTestingModule, TranslateTestingModule],
      providers: [GossipHandlerService],
    }).compileComponents();
  }));

  function setup(creatingNew: boolean) {
    handlerService = TestBed.inject(GossipHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    queryService = TestBed.inject(MysqlQueryService);
    querySpy = spyOn(queryService, 'query').and.returnValue(of([]));

    spyOn(queryService, 'selectAll').and.returnValue(of(creatingNew ? [] : [originalRow0, originalRow1, originalRow2]));

    fixture = TestBed.createComponent(GossipMenuOptionComponent);
    page = new GossipMenuOptionPage(fixture);
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
      expect(page.getInputById('OptionID').disabled).toBe(true);
      expect(page.getEditorTableRowsCount()).toBe(0);
    });

    it('should correctly update the unsaved status', () => {
      expect(handlerService.isGossipMenuOptionTableUnsaved).toBe(false);
      page.addNewRow();
      expect(handlerService.isGossipMenuOptionTableUnsaved).toBe(true);
      page.deleteRow();
      expect(handlerService.isGossipMenuOptionTableUnsaved).toBe(false);
    });

    it('adding new rows and executing the query should correctly work', () => {
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
  });

  describe('Editing existing', () => {
    beforeEach(() => setup(false));

    it('should correctly initialise', () => {
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
      page.clickRowOfDatatable(2);
      page.setInputValueById('OptionID', 0);

      page.expectUniqueError();
    });
  });
});
