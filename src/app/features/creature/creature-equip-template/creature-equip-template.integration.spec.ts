import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import Spy = jasmine.Spy;

import { CreatureEquipTemplateComponent } from './creature-equip-template.component';
import { CreatureEquipTemplateModule } from './creature-equip-template.module';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { highlightOptions } from '@keira-config/highlight.config';
import { HIGHLIGHT_OPTIONS } from 'ngx-highlightjs';
import { EditorPageObject } from '@keira-testing/editor-page-object';
import { CreatureEquipTemplate } from '@keira-types/creature-equip-template.type';
import { CreatureHandlerService } from '../creature-handler.service';
import { SaiCreatureHandlerService } from '../sai-creature-handler.service';

class CreatureEquipTemplatePage extends EditorPageObject<CreatureEquipTemplateComponent> {}

xdescribe('CreatureEquipTemplate integration tests', () => {
  let component: CreatureEquipTemplateComponent;
  let fixture: ComponentFixture<CreatureEquipTemplateComponent>;
  let queryService: MysqlQueryService;
  let querySpy: Spy;
  let handlerService: CreatureHandlerService;
  let page: CreatureEquipTemplatePage;

  const id = 1234;
  const expectedFullCreateQuery = 'DELETE FROM `creature_equip_template` WHERE (`CreatureID` = 1234);\n' +
    'INSERT INTO `creature_equip_template` (`CreatureID`, `ID`, `ItemID1`, `ItemID2`, `ItemID3`, `VerifiedBuild`) VALUES\n' +
    '(1234, 1, 0, 0, 0, 0);';

  const originalEntity = new CreatureEquipTemplate();
  originalEntity.CreatureID = id;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        CreatureEquipTemplateModule,
        RouterTestingModule,
      ],
      providers: [
        { provide: HIGHLIGHT_OPTIONS, useValue: highlightOptions },
        CreatureHandlerService,
        SaiCreatureHandlerService,
      ],
    })
      .compileComponents();
  }));

  function setup(creatingNew: boolean) {
    handlerService = TestBed.inject(CreatureHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    queryService = TestBed.inject(MysqlQueryService);
    querySpy = spyOn(queryService, 'query').and.returnValue(of());
    spyOn(queryService, 'queryValue').and.returnValue(of());

    spyOn(queryService, 'selectAll').and.returnValue(of(
      creatingNew ? [] : [originalEntity]
    ));

    fixture = TestBed.createComponent(CreatureEquipTemplateComponent);
    component = fixture.componentInstance;
    page = new CreatureEquipTemplatePage(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();
  }

  describe('Creating new', () => {
    beforeEach(() => setup(true));

    it('should correctly initialise',   waitForAsync(async () => {
      page.expectQuerySwitchToBeHidden();
      page.expectFullQueryToBeShown();
      await page.expectFullQueryToContain(expectedFullCreateQuery);
    }));

    it('should correctly update the unsaved status', () => {
      const field = 'ItemID1';
      expect(handlerService.isCreatureEquipTemplateUnsaved).toBe(false);
      page.setInputValueById(field, 3);
      expect(handlerService.isCreatureEquipTemplateUnsaved).toBe(true);
      page.setInputValueById(field, 0);
      expect(handlerService.isCreatureEquipTemplateUnsaved).toBe(false);
    });

    it('changing a property and executing the query should correctly work', waitForAsync(async () => {
      const expectedQuery = 'DELETE FROM `creature_equip_template` WHERE (`CreatureID` = 1234);\n' +
        'INSERT INTO `creature_equip_template` (`CreatureID`, `ID`, `ItemID1`, `ItemID2`, `ItemID3`, `VerifiedBuild`) VALUES\n' +
        '(1234, 1, 0, 2, 0, 0);';
      querySpy.calls.reset();

      page.setInputValueById('ItemID2', '2');
      page.clickExecuteQuery();

      await page.expectFullQueryToContain(expectedQuery);
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
    }));
  });

  describe('Editing existing', () => {
    beforeEach(() => setup(false));

    it('should correctly initialise', waitForAsync(async () => {
      page.expectDiffQueryToBeShown();
      page.expectDiffQueryToBeEmpty();
      await page.expectFullQueryToContain(expectedFullCreateQuery);
    }));

    it('changing all properties and executing the query should correctly work', waitForAsync(async () => {
      const expectedQuery = 'UPDATE `creature_equip_template` SET `ItemID2` = 1, `ItemID3` = 2 WHERE (`CreatureID` = 1234);';
      querySpy.calls.reset();

      page.changeAllFields(originalEntity, ['ID', 'VerifiedBuild']);
      page.clickExecuteQuery();

      await page.expectDiffQueryToContain(expectedQuery);
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
    }));

    it('changing values should correctly update the queries',  waitForAsync(async () => {
      page.setInputValueById('ItemID1', '1');
      await page.expectDiffQueryToContain(
        'UPDATE `creature_equip_template` SET `ItemID1` = 1 WHERE (`CreatureID` = 1234);'
      );
      await page.expectFullQueryToContain(
        'DELETE FROM `creature_equip_template` WHERE (`CreatureID` = 1234);\n' +
        'INSERT INTO `creature_equip_template` (`CreatureID`, `ID`, `ItemID1`, `ItemID2`, `ItemID3`, `VerifiedBuild`) VALUES\n' +
        '(1234, 1, 1, 0, 0, 0);'
      );

      page.setInputValueById('ItemID3', '3');
      await page.expectDiffQueryToContain(
        'UPDATE `creature_equip_template` SET `ItemID1` = 1, `ItemID3` = 3 WHERE (`CreatureID` = 1234);'
      );
      await page.expectFullQueryToContain(
        'DELETE FROM `creature_equip_template` WHERE (`CreatureID` = 1234);\n' +
        'INSERT INTO `creature_equip_template` (`CreatureID`, `ID`, `ItemID1`, `ItemID2`, `ItemID3`, `VerifiedBuild`) VALUES\n' +
        '(1234, 1, 1, 0, 3, 0);'
      );
    }));

    it('changing a value via ItemSelector should correctly work', waitForAsync(async () => {

      //  note: previously disabled because of:
      //  https://stackoverflow.com/questions/57336982/how-to-make-angular-tests-wait-for-previous-async-operation-to-complete-before-e

      const itemEntry = 1200;
      querySpy.and.returnValue(of(
        [{ entry: itemEntry, name: 'Mock Item' }]
      ));
      const field = 'ItemID1';
      page.clickElement(page.getSelectorBtn(field));
      page.expectModalDisplayed();
      await page.whenReady();

      page.clickSearchBtn();
      await page.whenReady();
      page.clickRowOfDatatableInModal(0);
      await page.whenReady();
      page.clickModalSelect();
      await page.whenReady();

      await page.expectDiffQueryToContain(
        'UPDATE `creature_equip_template` SET `ItemID1` = 1200 WHERE (`CreatureID` = 1234);'
      );
      await page.expectFullQueryToContain(
        'DELETE FROM `creature_equip_template` WHERE (`CreatureID` = 1234);\n' +
        'INSERT INTO `creature_equip_template` (`CreatureID`, `ID`, `ItemID1`, `ItemID2`, `ItemID3`, `VerifiedBuild`) VALUES\n' +
        '(1234, 1, 1200, 0, 0, 0);'
      );
    }));
  });
});

