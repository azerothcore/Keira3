import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import Spy = jasmine.Spy;

import { GossipMenuComponent } from './gossip-menu.component';
import { GossipMenuModule } from './gossip-menu.module';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { GossipMenu } from '@keira-types/gossip-menu.type';
import { GossipHandlerService } from '../gossip-handler.service';
import { MultiRowEditorPageObject } from '@keira-testing/multi-row-editor-page-object';
class GossipMenuPage extends MultiRowEditorPageObject<GossipMenuComponent> {}

fdescribe('GossipMenu integration tests', () => {
  let component: GossipMenuComponent;
  let fixture: ComponentFixture<GossipMenuComponent>;
  let queryService: MysqlQueryService;
  let querySpy: Spy;
  let handlerService: GossipHandlerService;
  let page: GossipMenuPage;

  const id = 1234;

  const originalRow0 = new GossipMenu();
  const originalRow1 = new GossipMenu();
  const originalRow2 = new GossipMenu();
  originalRow0.MenuID = originalRow1.MenuID = originalRow2.MenuID = id;
  originalRow0.TextID = 0;
  originalRow1.TextID = 1;
  originalRow2.TextID = 2;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        GossipMenuModule,
        RouterTestingModule,
      ],
      providers: [
        GossipHandlerService,
      ]
    })
      .compileComponents();
  }));

  function setup(creatingNew: boolean) {
    handlerService = TestBed.inject(GossipHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    queryService = TestBed.inject(MysqlQueryService);
    querySpy = spyOn(queryService, 'query').and.returnValue(of());

    spyOn(queryService, 'selectAll').and.returnValue(of(
      creatingNew ? [] : [originalRow0, originalRow1, originalRow2]
    ));

    fixture = TestBed.createComponent(GossipMenuComponent);
    component = fixture.componentInstance;
    page = new GossipMenuPage(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();
  }

  fdescribe('Creating new', () => {
    beforeEach(() => setup(true));

    it('should correctly initialise', async () => {
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToBeEmpty();
      expect(page.formError.hidden).toBe(true);
      expect(page.addNewRowBtn.disabled).toBe(false);
      expect(page.deleteSelectedRowBtn.disabled).toBe(true);
      expect(page.getInputById('TextID').disabled).toBe(true);
      expect(page.getEditorTableRowsCount()).toBe(0);
    });

    it('adding new rows and executing the query should correctly work', async () => {
      const expectedQuery = 'DELETE FROM `gossip_menu` WHERE (`MenuID` = 1234) AND (`TextID` IN (0, 1, 2));\n' +
        'INSERT INTO `gossip_menu` (`MenuID`, `TextID`) VALUES\n' +
        '(1234, 0),\n' +
        '(1234, 1),\n' +
        '(1234, 2);';
      querySpy.calls.reset();

      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(1);
      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(2);
      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(3);
      page.clickExecuteQuery();

      await page.whenStable();
      page.expectDiffQueryToContain(expectedQuery);
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
    });

    it('adding a row and changing its values should correctly update the queries', async () => {
      page.addNewRow();
      await page.whenStable();
      page.expectDiffQueryToContain(
        'DELETE FROM `gossip_menu` WHERE (`MenuID` = 1234) AND (`TextID` IN (0));\n' +
        'INSERT INTO `gossip_menu` (`MenuID`, `TextID`) VALUES\n' +
        '(1234, 0);'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `gossip_menu` WHERE (`MenuID` = 1234);\n' +
        'INSERT INTO `gossip_menu` (`MenuID`, `TextID`) VALUES\n' +
        '(1234, 0);'
      );

      page.setInputValueById('TextID', '123');
      await page.whenStable();
      page.expectDiffQueryToContain(
        'DELETE FROM `gossip_menu` WHERE (`MenuID` = 1234) AND (`TextID` IN (123));\n' +
        'INSERT INTO `gossip_menu` (`MenuID`, `TextID`) VALUES\n' +
        '(1234, 123);'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `gossip_menu` WHERE (`MenuID` = 1234);\n' +
        'INSERT INTO `gossip_menu` (`MenuID`, `TextID`) VALUES\n' +
        '(1234, 123);'
      );
    });
  });

  fdescribe('Editing existing', () => {
    beforeEach(() => setup(false));

    it('should correctly initialise', async () => {
      expect(page.formError.hidden).toBe(true);
      page.expectDiffQueryToBeShown();
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToContain('DELETE FROM `gossip_menu` WHERE (`MenuID` = 1234);\n' +
        'INSERT INTO `gossip_menu` (`MenuID`, `TextID`) VALUES\n' +
        '(1234, 0),\n' +
        '(1234, 1),\n' +
        '(1234, 2);');
      expect(page.getEditorTableRowsCount()).toBe(3);
    });

    it('deleting rows should correctly work', async () => {
      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(2);
      await page.whenStable();
      page.expectDiffQueryToContain(
        'DELETE FROM `gossip_menu` WHERE (`MenuID` = 1234) AND (`TextID` IN (1));'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `gossip_menu` WHERE (`MenuID` = 1234);\n' +
        'INSERT INTO `gossip_menu` (`MenuID`, `TextID`) VALUES\n' +
        '(1234, 0),\n' +
        '(1234, 2);'
      );

      page.deleteRow(1);
      expect(page.getEditorTableRowsCount()).toBe(1);
      await page.whenStable();
      page.expectDiffQueryToContain(
        'DELETE FROM `gossip_menu` WHERE (`MenuID` = 1234) AND (`TextID` IN (1, 2));'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `gossip_menu` WHERE (`MenuID` = 1234);\n' +
        'INSERT INTO `gossip_menu` (`MenuID`, `TextID`) VALUES\n' +
        '(1234, 0);'
      );

      page.deleteRow(0);
      expect(page.getEditorTableRowsCount()).toBe(0);
      await page.whenStable();
      page.expectDiffQueryToContain(
        'DELETE FROM `gossip_menu` WHERE `MenuID` = 1234;'
      );
      page.expectFullQueryToBeEmpty();
    });

    it('editing existing rows should correctly work', async () => {
      page.clickRowOfDatatable(1);
      page.setInputValueById('TextID', 123);

      await page.whenStable();
      page.expectDiffQueryToContain(
        'DELETE FROM `gossip_menu` WHERE (`MenuID` = 1234) AND (`TextID` IN (1, 123));\n' +
        'INSERT INTO `gossip_menu` (`MenuID`, `TextID`) VALUES\n' +
        '(1234, 123);'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `gossip_menu` WHERE (`MenuID` = 1234);\n' +
        'INSERT INTO `gossip_menu` (`MenuID`, `TextID`) VALUES\n' +
        '(1234, 0),\n' +
        '(1234, 123),\n' +
        '(1234, 2);'
      );
    });

    it('combining add, edit and delete should correctly work', async () => {
      page.addNewRow();
      expect(page.getEditorTableRowsCount()).toBe(4);

      page.clickRowOfDatatable(1);
      page.setInputValueById('TextID', 10);
      expect(page.getEditorTableRowsCount()).toBe(4);

      page.deleteRow(2);
      expect(page.getEditorTableRowsCount()).toBe(3);

      await page.whenStable();
      page.expectDiffQueryToContain(
        'DELETE FROM `gossip_menu` WHERE (`MenuID` = 1234) AND (`TextID` IN (1, 2, 10, 3));\n' +
        'INSERT INTO `gossip_menu` (`MenuID`, `TextID`) VALUES\n' +
        '(1234, 10),\n' +
        '(1234, 3);'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `gossip_menu` WHERE (`MenuID` = 1234);\n' +
        'INSERT INTO `gossip_menu` (`MenuID`, `TextID`) VALUES\n' +
        '(1234, 0),\n' +
        '(1234, 10),\n' +
        '(1234, 3);'
      );
    });

    it('using the same row id for multiple rows should correctly show an error', async () => {
      page.clickRowOfDatatable(2);
      page.setInputValueById('TextID', 0);

      page.expectUniqueError();
    });
  });
});

