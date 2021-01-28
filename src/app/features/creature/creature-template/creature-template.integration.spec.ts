import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import Spy = jasmine.Spy;

import { CreatureTemplateComponent } from './creature-template.component';
import { CreatureTemplateModule } from './creature-template.module';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { EditorPageObject } from '@keira-testing/editor-page-object';
import { CreatureTemplate } from '@keira-types/creature-template.type';
import { CreatureHandlerService } from '../creature-handler.service';
import { SaiCreatureHandlerService } from '../sai-creature-handler.service';

class CreatureTemplatePage extends EditorPageObject<CreatureTemplateComponent> {}

describe('CreatureTemplate integration tests', () => {
  let component: CreatureTemplateComponent;
  let fixture: ComponentFixture<CreatureTemplateComponent>;
  let queryService: MysqlQueryService;
  let querySpy: Spy;
  let handlerService: CreatureHandlerService;
  let page: CreatureTemplatePage;

  const id = 1234;
  const expectedFullCreateQuery = 'DELETE FROM `creature_template` WHERE (`entry` = 1234);\n' +
    'INSERT INTO `creature_template` (`entry`, `difficulty_entry_1`, `difficulty_entry_2`, `difficulty_entry_3`,' +
    ' `KillCredit1`, `KillCredit2`, `modelid1`, `modelid2`, `modelid3`, `modelid4`, `name`, `subname`,' +
    ' `IconName`, `gossip_menu_id`, `minlevel`, `maxlevel`, `exp`, `faction`, `npcflag`, `speed_walk`,' +
    ' `speed_run`, `scale`, `rank`, `mindmg`, `maxdmg`, `dmgschool`, `attackpower`, `DamageModifier`,' +
    ' `BaseAttackTime`, `RangeAttackTime`, `unit_class`, `unit_flags`, `unit_flags2`, `dynamicflags`,' +
    ' `family`, `trainer_type`, `trainer_spell`, `trainer_class`, `trainer_race`, `minrangedmg`,' +
    ' `maxrangedmg`, `rangedattackpower`, `type`, `type_flags`, `lootid`, `pickpocketloot`, `skinloot`,' +
    ' `spell1`, `spell2`, `spell3`, `spell4`, `spell5`, `spell6`, `spell7`, `spell8`, `PetSpellDataId`,' +
    ' `VehicleId`, `mingold`, `maxgold`, `AIName`, `MovementType`, `InhabitType`, `HoverHeight`,' +
    ' `HealthModifier`, `ManaModifier`, `ArmorModifier`, `RacialLeader`, `movementId`, `RegenHealth`,' +
    ' `mechanic_immune_mask`, `spell_school_immune_mask`, `flags_extra`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
    '(1234, 0, 0, 0, 0, 0, 0, 0, 0, 0, \'\', \'\', \'\', 0, 1, 1, 0, 0, 0, 1, 1.14286, 1, 0, 0, 0,' +
    ' 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,' +
    ' 0, 0, 0, 0, 0, 0, \'\', 0, 3, 1, 1, 1, 1, 0, 0, 1, 0, 0, \'\', 0);';

  const originalEntity = new CreatureTemplate();
  originalEntity.entry = id;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        CreatureTemplateModule,
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

    fixture = TestBed.createComponent(CreatureTemplateComponent);
    component = fixture.componentInstance;
    page = new CreatureTemplatePage(fixture);
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
      const expectedQuery = 'DELETE FROM `creature_template` WHERE (`entry` = 1234);\n' +
      'INSERT INTO `creature_template` (`entry`, `difficulty_entry_1`, `difficulty_entry_2`, `difficulty_entry_3`,' +
      ' `KillCredit1`, `KillCredit2`, `modelid1`, `modelid2`, `modelid3`, `modelid4`, `name`, `subname`,' +
      ' `IconName`, `gossip_menu_id`, `minlevel`, `maxlevel`, `exp`, `faction`, `npcflag`, `speed_walk`,' +
      ' `speed_run`, `scale`, `rank`, `mindmg`, `maxdmg`, `dmgschool`, `attackpower`, `DamageModifier`,' +
      ' `BaseAttackTime`, `RangeAttackTime`, `unit_class`, `unit_flags`, `unit_flags2`, `dynamicflags`,' +
      ' `family`, `trainer_type`, `trainer_spell`, `trainer_class`, `trainer_race`, `minrangedmg`,' +
      ' `maxrangedmg`, `rangedattackpower`, `type`, `type_flags`, `lootid`, `pickpocketloot`, `skinloot`,' +
      ' `spell1`, `spell2`, `spell3`, `spell4`, `spell5`, `spell6`, `spell7`, `spell8`, `PetSpellDataId`,' +
      ' `VehicleId`, `mingold`, `maxgold`, `AIName`, `MovementType`, `InhabitType`, `HoverHeight`,' +
      ' `HealthModifier`, `ManaModifier`, `ArmorModifier`, `RacialLeader`, `movementId`, `RegenHealth`,' +
      ' `mechanic_immune_mask`, `spell_school_immune_mask`, `flags_extra`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
      '(1234, 0, 0, 0, 0, 0, 0, 0, 0, 0, \'Shin\', \'\', \'\', 0, 1, 1, 0, 0, 0, 1, 1.14286, 1, 0, 0, 0,' +
      ' 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,' +
      ' 0, 0, 0, 0, 0, 0, \'\', 0, 3, 1, 1, 1, 1, 0, 0, 1, 0, 0, \'\', 0);';
      querySpy.calls.reset();

      page.setInputValueById('name', 'Shin');
      page.clickExecuteQuery();

      page.expectFullQueryToContain(expectedQuery);
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
    });

    it('should correctly update the unsaved status', () => {
      const field = 'difficulty_entry_1';
      expect(handlerService.isCreatureTemplateUnsaved).toBe(false);
      page.setInputValueById(field, 3);
      expect(handlerService.isCreatureTemplateUnsaved).toBe(true);
      page.setInputValueById(field, 0);
      expect(handlerService.isCreatureTemplateUnsaved).toBe(false);
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
      const expectedQuery = 'UPDATE `creature_template` SET ' +
        '`difficulty_entry_2` = 1, `difficulty_entry_3` = 2, `KillCredit1` = 3, `KillCredit2` = 4, `modelid1` = 5, `modelid2` = 6, ' +
        '`modelid3` = 7, `modelid4` = 8, `name` = \'9\', `subname` = \'10\', `IconName` = \'11\', `gossip_menu_id` = 12, ' +
        '`minlevel` = 13, `maxlevel` = 14, `exp` = 15, `faction` = 16, `npcflag` = 17, `speed_walk` = 18, `speed_run` = 19, ' +
        '`scale` = 20, `rank` = 21, `mindmg` = 22, `maxdmg` = 23, `dmgschool` = 24, `attackpower` = 25, `DamageModifier` = 26, ' +
        '`BaseAttackTime` = 27, `RangeAttackTime` = 28, `unit_class` = 29, `unit_flags` = 30, `unit_flags2` = 31, ' +
        '`dynamicflags` = 32, `family` = 33, `trainer_type` = 34, `trainer_spell` = 35, `trainer_class` = 36, `trainer_race` = 37, ' +
        '`minrangedmg` = 38, `maxrangedmg` = 39, `rangedattackpower` = 40, `type` = 41, `type_flags` = 42, `lootid` = 43, ' +
        '`pickpocketloot` = 44, `skinloot` = 45, `spell1` = 46, `spell2` = 47, `spell3` = 48, `spell4` = 49, `spell5` = 50, ' +
        '`spell6` = 51, `spell7` = 52, `spell8` = 53, `PetSpellDataId` = 54, `VehicleId` = 55, `mingold` = 56, `maxgold` = 57, ' +
        '`AIName` = \'58\', `MovementType` = 59, `InhabitType` = 60, `HoverHeight` = 61, `HealthModifier` = 62, `ManaModifier` = 63, ' +
        '`ArmorModifier` = 64, `RacialLeader` = 65, `movementId` = 66, `RegenHealth` = 67, `mechanic_immune_mask` = 68, `spell_school_immune_mask = 69` ' +
        '`flags_extra` = 70, `ScriptName` = \'71\' WHERE (`entry` = 1234);';
      querySpy.calls.reset();

      page.changeAllFields(originalEntity, ['VerifiedBuild']);
      page.clickExecuteQuery();

      page.expectDiffQueryToContain(expectedQuery);
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
    });

    it('changing values should correctly update the queries', () => {
      // Note: full query check has been shortened here because the table is too big, don't do this in other tests unless necessary

      page.setInputValueById('name', 'Shin');
      page.expectDiffQueryToContain(
        'UPDATE `creature_template` SET `name` = \'Shin\' WHERE (`entry` = 1234);'
      );
      page.expectFullQueryToContain('Shin');

      page.setInputValueById('subname', 'AC Developer');
      page.expectDiffQueryToContain(
        'UPDATE `creature_template` SET `name` = \'Shin\', `subname` = \'AC Developer\' WHERE (`entry` = 1234);'
      );
      page.expectFullQueryToContain('Shin');
      page.expectFullQueryToContain('AC Developer');
    });

    it('changing a value via FlagsSelector should correctly work', waitForAsync(async () => {
      const field = 'unit_flags';
      page.clickElement(page.getSelectorBtn(field));
      page.expectModalDisplayed();
      await page.whenReady();

      page.toggleFlagInRowExternal(2);

      await page.whenReady();
      page.toggleFlagInRowExternal(12);

      await page.whenReady();
      page.clickModalSelect();
      await page.whenReady();

      expect(page.getInputById(field).value).toEqual('4100');
      page.expectDiffQueryToContain(
        'UPDATE `creature_template` SET `unit_flags` = 4100 WHERE (`entry` = 1234);'
      );

      // Note: full query check has been shortened here because the table is too big, don't do this in other tests unless necessary
      page.expectFullQueryToContain('4100');
    }));
  });
});

