import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import Spy = jasmine.Spy;

import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { CreatureTemplateResistanceComponent } from './creature-template-resistance.component';
import { CreatureTemplateResistanceModule } from './creature-template-resistance.module';
import { EditorPageObject } from '@keira-testing/editor-page-object';
import { CreatureHandlerService } from '../creature-handler.service';
import { CreatureTemplateResistance } from '@keira-types/creature-template-resistance.type';
import { SaiCreatureHandlerService } from '../sai-creature-handler.service';

class CreatureTemplateResistancePage extends EditorPageObject<CreatureTemplateResistanceComponent> {}

describe('CreatureTemplateresistance integration tests', () => {
  let component: CreatureTemplateResistanceComponent;
  let fixture: ComponentFixture<CreatureTemplateResistanceComponent>;
  let queryService: MysqlQueryService;
  let querySpy: Spy;
  let handlerService: CreatureHandlerService;
  let page: CreatureTemplateResistancePage;

  const id = 1234;
  const expectedFullCreateQuery = 'DELETE FROM `creature_template_resistance` WHERE (`CreatureID` = 1234) AND (`School` IN (1,2,3,4,5,6));\n' +
    'INSERT INTO `creature_template_resistance` (`CreatureID`, `School`, `Resistance`, `VerifiedBuild`) VALUES\n' +
    '(1234, 0, 0, 0);';

  const originalEntity = new CreatureTemplateResistance();
  originalEntity.CreatureID = id;
  originalEntity.School = 1;
  originalEntity.Resistance = 0;
  originalEntity.VerifiedBuild = 0;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        CreatureTemplateResistanceModule,
        RouterTestingModule,
      ],
      providers: [
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

    fixture = TestBed.createComponent(CreatureTemplateResistanceComponent);
    component = fixture.componentInstance;
    page = new CreatureTemplateResistancePage(fixture);
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
      const field = 'School';
      expect(handlerService.isCreatureTemplateResistanceUnsaved).toBe(false);
      page.setInputValueById(field, 3);
      expect(handlerService.isCreatureTemplateResistanceUnsaved).toBe(true);
      page.setInputValueById(field, 0);
      expect(handlerService.isCreatureTemplateResistanceUnsaved).toBe(false);
    });

    it('changing a property and executing the query should correctly work', () => {
      const expectedQuery = 'DELETE FROM `creature_template_resistance` WHERE (`CreatureID` = 1234) AND (`School` IN (1,2,3,4,5,6));\n' +
        'INSERT INTO `creature_template_resistance` (`CreatureID`, `School`, `Resistance`, `VerifiedBuild`) VALUES\n' +
        '(1234, 1, 1, 0);';
      querySpy.calls.reset();

      page.setInputValueById('Resistance', '1');
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
      const expectedQuery = 'UPDATE `creature_template_resistance` SET ' +
        '`Resistance` = 2, WHERE (`CreatureID` = 1234) AND (`School` = 1);';
      querySpy.calls.reset();

      page.changeAllFields(originalEntity, ['ID', 'VerifiedBuild']);
      page.clickExecuteQuery();

      page.expectDiffQueryToContain(expectedQuery);
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
    });

    it('changing values should correctly update the queries', () => {
      page.setInputValueById('School', '1');
      page.expectDiffQueryToContain(
        'UPDATE `creature_template_resistance` SET `School` = 1 WHERE (`CreatureID` = 1234) AND (`School` IN (1,2,3,4,5,6));'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_template_resistance` WHERE (`CreatureID` = 1234) AND (`School` IN (1,2,3,4,5,6));\n' +
        'INSERT INTO `creature_template_resistance` (`CreatureID`, `School`, `Resistance`, `VerifiedBuild`) VALUES\n' +
        '(1234, 1, 1, 0);'
      );
    });

    it('changing a value via SingleValueSelector should correctly work', waitForAsync(async () => {
      const field = 'Resistance';
      page.clickElement(page.getSelectorBtn(field));

      await page.whenReady();
      page.expectModalDisplayed();

      page.clickRowOfDatatableInModal(8);

      await page.whenReady();
      page.clickModalSelect();
      await page.whenReady();

      expect(page.getInputById(field).value).toEqual('10');
      page.expectDiffQueryToContain(
        'UPDATE `creature_template_resistance` SET `Resistance` = 10 WHERE (`CreatureID` = 1234) AND (`School` = 1);'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_template_resistance` WHERE (`CreatureID` = 1234) AND (`School` IN (1,2,3,4,5,6));\n' +
        'INSERT INTO `creature_template_resistance` (`CreatureID`, `School`, `Resistance`, `VerifiedBuild`) VALUES\n' +
        '(1234, 1, 10, 0);'
      );
    }));
  });
});
