import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import Spy = jasmine.Spy;

import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { CreatureTemplateAddonComponent } from './creature-template-addon.component';
import { CreatureTemplateAddonModule } from './creature-template-addon.module';
import { EditorPageObject } from '@keira-testing/editor-page-object';
import { CreatureHandlerService } from '../creature-handler.service';
import { CreatureTemplateAddon } from '@keira-types/creature-template-addon.type';
import { SaiCreatureHandlerService } from '../sai-creature-handler.service';

class CreatureTemplateAddonPage extends EditorPageObject<CreatureTemplateAddonComponent> {}

describe('CreatureTemplateAddon integration tests', () => {
  let component: CreatureTemplateAddonComponent;
  let fixture: ComponentFixture<CreatureTemplateAddonComponent>;
  let queryService: MysqlQueryService;
  let querySpy: Spy;
  let handlerService: CreatureHandlerService;
  let page: CreatureTemplateAddonPage;

  const id = 1234;
  const expectedFullCreateQuery = 'DELETE FROM `creature_template_addon` WHERE (`entry` = 1234);\n' +
    'INSERT INTO `creature_template_addon` (`entry`, `path_id`, `mount`, `bytes1`, `bytes2`, `emote`, `isLarge`, `auras`) VALUES\n' +
    '(1234, 0, 0, 0, 0, 0, 0, \'\');';

  const originalEntity = new CreatureTemplateAddon();
  originalEntity.entry = id;
  originalEntity.auras = null;
  originalEntity.bytes1 = 1;
  originalEntity.bytes2 = 2;
  originalEntity.emote = 3;
  originalEntity.mount = 0;
  originalEntity.path_id = 123;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CreatureTemplateAddonModule,
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

    spyOn(queryService, 'selectAll').and.returnValue(of(
      creatingNew ? [] : [originalEntity]
    ));

    fixture = TestBed.createComponent(CreatureTemplateAddonComponent);
    component = fixture.componentInstance;
    page = new CreatureTemplateAddonPage(fixture);
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
      const expectedQuery = 'DELETE FROM `creature_template_addon` WHERE (`entry` = 1234);\n' +
        'INSERT INTO `creature_template_addon` (`entry`, `path_id`, `mount`, `bytes1`, `bytes2`, `emote`, `isLarge`, `auras`) VALUES\n' +
        '(1234, 3, 0, 0, 0, 0, 0, \'\');';
      querySpy.calls.reset();

      page.setInputValueById('path_id', 3);
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
      page.expectFullQueryToContain('DELETE FROM `creature_template_addon` WHERE (`entry` = 1234);\n' +
        'INSERT INTO `creature_template_addon` (`entry`, `path_id`, `mount`, `bytes1`, `bytes2`, `emote`, `isLarge`, `auras`) VALUES\n' +
        '(1234, 123, 0, 1, 2, 3, 0, NULL);');
    });

    it('changing all properties and executing the query should correctly work', () => {
      const expectedQuery = 'UPDATE `creature_template_addon` SET ' +
        '`path_id` = 0, `mount` = 1, `bytes1` = 2, `bytes2` = 3, `emote` = 4, `isLarge` = 5, `auras` = \'6\' WHERE (`entry` = 1234);';
      querySpy.calls.reset();

      page.changeAllFields(originalEntity, ['VerifiedBuild']);
      page.clickExecuteQuery();

      page.expectDiffQueryToContain(expectedQuery);
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
    });

    it('changing values should correctly update the queries', () => {
      page.setInputValueById('path_id', '3');
      page.expectDiffQueryToContain(
        'UPDATE `creature_template_addon` SET `path_id` = 3 WHERE (`entry` = 1234);'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_template_addon` WHERE (`entry` = 1234);\n' +
        'INSERT INTO `creature_template_addon` (`entry`, `path_id`, `mount`, `bytes1`, `bytes2`, `emote`, `isLarge`, `auras`) VALUES\n' +
        '(1234, 3, 0, 1, 2, 3, 0, NULL);'
      );

      page.setInputValueById('bytes1', '2');
      page.expectDiffQueryToContain(
        'UPDATE `creature_template_addon` SET `path_id` = 3, `bytes1` = 2 WHERE (`entry` = 1234);'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_template_addon` WHERE (`entry` = 1234);\n' +
        'INSERT INTO `creature_template_addon` (`entry`, `path_id`, `mount`, `bytes1`, `bytes2`, `emote`, `isLarge`, `auras`) VALUES\n' +
        '(1234, 3, 0, 2, 2, 3, 0, NULL);\n'
      );
    });

    it('changing a value via SingleValueSelector should correctly work', async () => {
      const field = 'bytes1';
      page.clickElement(page.getSelectorBtn(field));
      page.expectModalDisplayed();

      page.clickRowOfDatatable(8);
      page.clickModalSelect();
      await fixture.whenStable();
      await fixture.whenRenderingDone();

      expect(page.getInputById(field).value).toEqual('8');
      page.expectDiffQueryToContain(
        'UPDATE `creature_template_addon` SET `bytes1` = 8 WHERE (`entry` = 1234);'
      );
      page.expectFullQueryToContain(
        'DELETE FROM `creature_template_addon` WHERE (`entry` = 1234);\n' +
        'INSERT INTO `creature_template_addon` (`entry`, `path_id`, `mount`, `bytes1`, `bytes2`, `emote`, `isLarge`, `auras`) VALUES\n' +
        '(1234, 123, 0, 8, 2, 3, 0, NULL);'
      );
    });
  });
});
