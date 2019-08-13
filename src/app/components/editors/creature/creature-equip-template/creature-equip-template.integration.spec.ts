import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import Spy = jasmine.Spy;

import { CreatureEquipTemplateComponent } from './creature-equip-template.component';
import { CreatureEquipTemplateModule } from './creature-equip-template.module';
import { QueryService } from '../../../../services/query.service';
import { EditorPageObject } from '../../../../test-utils/editor-page-object';
import { CreatureEquipTemplate } from '../../../../types/creature-equip-template.type';
import { CreatureHandlerService } from '../../../../services/handlers/creature-handler.service';

class CreatureEquipTemplatePage extends EditorPageObject<CreatureEquipTemplateComponent> {}

describe('CreatureEquipTemplate integration tests', () => {
  let component: CreatureEquipTemplateComponent;
  let fixture: ComponentFixture<CreatureEquipTemplateComponent>;
  let queryService: QueryService;
  let querySpy: Spy;
  let handlerService: CreatureHandlerService;
  let page: CreatureEquipTemplatePage;

  const id = 1234;
  const expectedFullCreateQuery = 'DELETE FROM `creature_equip_template` WHERE (`CreatureID` = 1234);\n' +
    'INSERT INTO `creature_equip_template` (`CreatureID`, `ID`, `ItemID1`, `ItemID2`, `ItemID3`, `VerifiedBuild`) VALUES\n' +
    '(1234, 1, 0, 0, 0, 0);';

  const originalEntity = new CreatureEquipTemplate();
  originalEntity.CreatureID = id;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CreatureEquipTemplateModule,
        RouterTestingModule,
      ],
    })
      .compileComponents();
  }));

  function setup(creatingNew: boolean) {
    handlerService = TestBed.get(CreatureHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    queryService = TestBed.get(QueryService);
    querySpy = spyOn(queryService, 'query').and.returnValue(of());

    spyOn(queryService, 'selectAll').and.returnValue(of(
      { results: creatingNew ? [] : [originalEntity] }
    ));

    fixture = TestBed.createComponent(CreatureEquipTemplateComponent);
    component = fixture.componentInstance;
    page = new CreatureEquipTemplatePage(fixture);
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
      const expectedQuery = 'DELETE FROM `creature_equip_template` WHERE (`CreatureID` = 1234);\n' +
        'INSERT INTO `creature_equip_template` (`CreatureID`, `ID`, `ItemID1`, `ItemID2`, `ItemID3`, `VerifiedBuild`) VALUES\n' +
        '(1234, 1, 0, 2, 0, 0);';
      querySpy.calls.reset();

      page.setInputValueById('ItemID2', '2');
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
      page.expectFullQueryToContain(expectedFullCreateQuery);
    });

    it('changing all properties and executing the query should correctly work', () => {
      const expectedQuery = 'UPDATE `creature_equip_template` SET `ItemID2` = 1, `ItemID3` = 2 WHERE (`CreatureID` = 1234);';
      querySpy.calls.reset();

      page.changeAllFields(originalEntity, ['ID', 'VerifiedBuild']);
      page.clickExecuteQuery();

      page.expectDiffQueryToContain(expectedQuery);
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
    });

    it('changing values should correctly update the queries', () => {
      page.setInputValueById('ItemID1', '1');
      page.expectDiffQueryToContain(
        'UPDATE `creature_equip_template` SET `ItemID1` = 1 WHERE (`CreatureID` = 1234);'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_equip_template` WHERE (`CreatureID` = 1234);\n' +
        'INSERT INTO `creature_equip_template` (`CreatureID`, `ID`, `ItemID1`, `ItemID2`, `ItemID3`, `VerifiedBuild`) VALUES\n' +
        '(1234, 1, 1, 0, 0, 0);'
      );

      page.setInputValueById('ItemID3', '3');
      page.expectDiffQueryToContain(
        'UPDATE `creature_equip_template` SET `ItemID1` = 1, `ItemID3` = 3 WHERE (`CreatureID` = 1234);'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_equip_template` WHERE (`CreatureID` = 1234);\n' +
        'INSERT INTO `creature_equip_template` (`CreatureID`, `ID`, `ItemID1`, `ItemID2`, `ItemID3`, `VerifiedBuild`) VALUES\n' +
        '(1234, 1, 1, 0, 3, 0);'
      );
    });

    xit('changing a value via ItemSelector should correctly work', async(() => {

      // TODO: test excluded since it will make other tests failing, see:
      //  https://stackoverflow.com/questions/57336982/how-to-make-angular-tests-wait-for-previous-async-operation-to-complete-before-e

      const itemEntry = 1200;
      querySpy.and.returnValue(of(
        { results: [{ entry: itemEntry, name: 'Mock Item' }] }
      ));
      const field = 'ItemID1';
      page.clickElement(page.getSelectorBtn(field));
      page.expectModalDisplayed();

      page.clickItemSearchBtn();

      fixture.whenStable().then(() => {
        page.clickRowOfDatatable(0);
        page.clickModalSelect();

        page.expectDiffQueryToContain(
          'UPDATE `creature_equip_template` SET `ItemID1` = 1200 WHERE (`CreatureID` = 1234);'
        );
        page.expectFullQueryToContain(
          'DELETE FROM `creature_equip_template` WHERE (`CreatureID` = 1234);\n' +
          'INSERT INTO `creature_equip_template` (`CreatureID`, `ID`, `ItemID1`, `ItemID2`, `ItemID3`, `VerifiedBuild`) VALUES\n' +
          '(1234, 1, 1200, 0, 0, 0);'
        );
      });
    }));
  });
});

