import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { ToastrModule } from 'ngx-toastr';
import { ModalModule } from 'ngx-bootstrap/modal';
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
  const expectedFullCreateQuery =
    'DELETE FROM `creature_template` WHERE (`entry` = 1234);\n' +
    'INSERT INTO `creature_template` (`entry`, `difficulty_entry_1`, `difficulty_entry_2`, `difficulty_entry_3`, ' +
    '`KillCredit1`, `KillCredit2`, `modelid1`, `modelid2`, `modelid3`, `modelid4`, `name`, `subname`, ' +
    '`IconName`, `gossip_menu_id`, `minlevel`, `maxlevel`, `exp`, `faction`, `npcflag`, `speed_walk`, `speed_run`, `speed_swim`, `speed_flight`, `detection_range`, ' +
    '`scale`, `rank`, `dmgschool`, `DamageModifier`, `BaseAttackTime`, `RangeAttackTime`, `BaseVariance`, `RangeVariance`, ' +
    '`unit_class`, `unit_flags`, `unit_flags2`, `dynamicflags`, `family`, `trainer_type`, `trainer_spell`, `trainer_class`, ' +
    '`trainer_race`, `type`, `type_flags`, `lootid`, `pickpocketloot`, `skinloot`, `PetSpellDataId`, `VehicleId`, `mingold`, ' +
    '`maxgold`, `AIName`, `MovementType`, `HoverHeight`, `HealthModifier`, `ManaModifier`, `ArmorModifier`, `ExperienceModifier`, ' +
    '`RacialLeader`, `movementId`, `RegenHealth`, `mechanic_immune_mask`, `spell_school_immune_mask`, ' +
    '`flags_extra`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
    "(1234, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', '', '', 0, 1, 1, 0, 0, 0, 1, 1.14286, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, " +
    "0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', 0, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, '', 0);\n";

  const originalEntity = new CreatureTemplate();
  originalEntity.entry = id;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [ToastrModule.forRoot(), ModalModule.forRoot(), CreatureTemplateModule, RouterTestingModule],
        providers: [CreatureHandlerService, SaiCreatureHandlerService],
      }).compileComponents();
    }),
  );

  function setup(creatingNew: boolean) {
    handlerService = TestBed.inject(CreatureHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    queryService = TestBed.inject(MysqlQueryService);
    querySpy = spyOn(queryService, 'query').and.returnValue(of([]));

    spyOn(queryService, 'selectAll').and.returnValue(of(creatingNew ? [] : [originalEntity]));

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
      const expectedQuery =
        'DELETE FROM `creature_template` WHERE (`entry` = 1234);\n' +
        'INSERT INTO `creature_template` (`entry`, `difficulty_entry_1`, `difficulty_entry_2`, `difficulty_entry_3`, ' +
        '`KillCredit1`, `KillCredit2`, `modelid1`, `modelid2`, `modelid3`, `modelid4`, `name`, `subname`, `IconName`, ' +
        '`gossip_menu_id`, `minlevel`, `maxlevel`, `exp`, `faction`, `npcflag`, `speed_walk`, `speed_run`, `speed_swim`, `speed_flight`, `detection_range`, ' +
        '`scale`, `rank`, `dmgschool`, `DamageModifier`, `BaseAttackTime`, `RangeAttackTime`, `BaseVariance`, ' +
        '`RangeVariance`, `unit_class`, `unit_flags`, `unit_flags2`, `dynamicflags`, `family`, ' +
        '`trainer_type`, `trainer_spell`, `trainer_class`, `trainer_race`, `type`, `type_flags`, ' +
        '`lootid`, `pickpocketloot`, `skinloot`, `PetSpellDataId`, `VehicleId`, `mingold`, `maxgold`, ' +
        '`AIName`, `MovementType`, `HoverHeight`, `HealthModifier`, `ManaModifier`, `ArmorModifier`, `ExperienceModifier`, `RacialLeader`, ' +
        '`movementId`, `RegenHealth`, `mechanic_immune_mask`, `spell_school_immune_mask`, `flags_extra`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
        "(1234, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'Shin', '', '', 0, 1, 1, 0, 0, 0, 1, 1.14286, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0," +
        " 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', 0, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, '', 0);";

      querySpy.calls.reset();

      page.setInputValueById('name', 'Shin');
      page.expectFullQueryToContain(expectedQuery);

      page.clickExecuteQuery();

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
      const expectedQuery =
        'UPDATE `creature_template` SET `difficulty_entry_2` = 1, `difficulty_entry_3` = 2, ' +
        '`KillCredit1` = 3, `KillCredit2` = 4, `modelid1` = 5, `modelid2` = 6, `modelid3` = 7, `modelid4` = 8, ' +
        "`name` = '9', `subname` = '10', `IconName` = '11', `gossip_menu_id` = 12, `minlevel` = 13, `maxlevel` = 14, " +
        '`exp` = 15, `faction` = 16, `npcflag` = 17, `speed_walk` = 18, `speed_run` = 19, `detection_range` = 20, `scale` = 21, `rank` = 22, ' +
        '`dmgschool` = 23, `DamageModifier` = 24, `BaseAttackTime` = 25, `RangeAttackTime` = 26, `BaseVariance` = 27, ' +
        '`RangeVariance` = 28, `unit_class` = 29, `unit_flags` = 30, `unit_flags2` = 31, `dynamicflags` = 32, `family` = 33, ' +
        '`trainer_type` = 34, `trainer_spell` = 35, `trainer_class` = 36, `trainer_race` = 37, `type` = 38, `type_flags` = 39, ' +
        '`lootid` = 40, `pickpocketloot` = 41, `skinloot` = 42, `PetSpellDataId` = 43, `VehicleId` = 44, ' +
        "`mingold` = 45, `maxgold` = 46, `AIName` = '47', `MovementType` = 48, `HoverHeight` = 49, " +
        '`HealthModifier` = 50, `ManaModifier` = 51, `ArmorModifier` = 52, `ExperienceModifier` = 53, `RacialLeader` = 54, `movementId` = 55, `RegenHealth` = 56, ' +
        "`mechanic_immune_mask` = 57, `spell_school_immune_mask` = 58, `flags_extra` = 59, `ScriptName` = '60' WHERE (`entry` = 1234);";

      querySpy.calls.reset();

      page.changeAllFields(originalEntity, ['VerifiedBuild']);
      page.expectDiffQueryToContain(expectedQuery);

      page.clickExecuteQuery();
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
    });

    it('changing values should correctly update the queries', () => {
      // Note: full query check has been shortened here because the table is too big, don't do this in other tests unless necessary

      page.setInputValueById('name', 'Shin');
      page.expectDiffQueryToContain("UPDATE `creature_template` SET `name` = 'Shin' WHERE (`entry` = 1234);");
      page.expectFullQueryToContain('Shin');

      page.setInputValueById('subname', 'AC Developer');
      page.expectDiffQueryToContain("UPDATE `creature_template` SET `name` = 'Shin', `subname` = 'AC Developer' WHERE (`entry` = 1234);");
      page.expectFullQueryToContain('Shin');
      page.expectFullQueryToContain('AC Developer');
    });

    xit(
      'changing a value via FlagsSelector should correctly work',
      waitForAsync(async () => {
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
        page.expectDiffQueryToContain('UPDATE `creature_template` SET `unit_flags` = 4100 WHERE (`entry` = 1234);');

        // Note: full query check has been shortened here because the table is too big, don't do this in other tests unless necessary
        page.expectFullQueryToContain('4100');
      }),
    );
  });
});
