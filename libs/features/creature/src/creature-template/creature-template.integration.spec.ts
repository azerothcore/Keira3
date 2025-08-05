import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CreatureTemplate } from '@keira/shared/acore-world-model';
import { KEIRA_APP_CONFIG_TOKEN, KEIRA_MOCK_CONFIG } from '@keira/shared/config';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';
import { EditorPageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { instance, mock } from 'ts-mockito';
import { CreatureHandlerService } from '../creature-handler.service';
import { SaiCreatureHandlerService } from '../sai-creature-handler.service';
import { CreatureTemplateComponent } from './creature-template.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import Spy = jasmine.Spy;

class CreatureTemplatePage extends EditorPageObject<CreatureTemplateComponent> {}

describe('CreatureTemplate integration tests', () => {
  let fixture: ComponentFixture<CreatureTemplateComponent>;
  let queryService: MysqlQueryService;
  let querySpy: Spy;
  let handlerService: CreatureHandlerService;
  let page: CreatureTemplatePage;

  const id = 1234;
  const expectedFullCreateQuery =
    'DELETE FROM `creature_template` WHERE (`entry` = 1234);\n' +
    'INSERT INTO `creature_template` (`entry`, `difficulty_entry_1`, `difficulty_entry_2`, `difficulty_entry_3`, ' +
    '`KillCredit1`, `KillCredit2`, `name`, `subname`, ' +
    '`IconName`, `gossip_menu_id`, `minlevel`, `maxlevel`, `exp`, `faction`, `npcflag`, `speed_walk`, `speed_run`, `speed_swim`, `speed_flight`, `detection_range`, ' +
    '`scale`, `rank`, `dmgschool`, `DamageModifier`, `BaseAttackTime`, `RangeAttackTime`, `BaseVariance`, `RangeVariance`, ' +
    '`unit_class`, `unit_flags`, `unit_flags2`, `dynamicflags`, `family`, `trainer_type`, `trainer_spell`, `trainer_class`, ' +
    '`trainer_race`, `type`, `type_flags`, `lootid`, `pickpocketloot`, `skinloot`, `PetSpellDataId`, `VehicleId`, `mingold`, ' +
    '`maxgold`, `AIName`, `MovementType`, `HoverHeight`, `HealthModifier`, `ManaModifier`, `ArmorModifier`, `ExperienceModifier`, ' +
    '`RacialLeader`, `movementId`, `RegenHealth`, `mechanic_immune_mask`, `spell_school_immune_mask`, ' +
    '`flags_extra`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
    "(1234, 0, 0, 0, 0, 0, '', '', '', 0, 1, 1, 0, 0, 0, 1, 1.14286, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, " +
    "0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', 0, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, '', 0);\n";

  const originalEntity = new CreatureTemplate();
  originalEntity.entry = id;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalModule.forRoot(), CreatureTemplateComponent, RouterTestingModule, TranslateTestingModule],
      providers: [
        { provide: KEIRA_APP_CONFIG_TOKEN, useValue: KEIRA_MOCK_CONFIG },
        CreatureHandlerService,
        SaiCreatureHandlerService,
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
  }));

  function setup(creatingNew: boolean) {
    handlerService = TestBed.inject(CreatureHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    queryService = TestBed.inject(MysqlQueryService);
    querySpy = spyOn(queryService, 'query').and.returnValue(of([]));

    spyOn(queryService, 'selectAll').and.returnValue(of(creatingNew ? [] : [originalEntity]));

    fixture = TestBed.createComponent(CreatureTemplateComponent);
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
        '`KillCredit1`, `KillCredit2`, `name`, `subname`, `IconName`, ' +
        '`gossip_menu_id`, `minlevel`, `maxlevel`, `exp`, `faction`, `npcflag`, `speed_walk`, `speed_run`, `speed_swim`, `speed_flight`, `detection_range`, ' +
        '`scale`, `rank`, `dmgschool`, `DamageModifier`, `BaseAttackTime`, `RangeAttackTime`, `BaseVariance`, ' +
        '`RangeVariance`, `unit_class`, `unit_flags`, `unit_flags2`, `dynamicflags`, `family`, ' +
        '`trainer_type`, `trainer_spell`, `trainer_class`, `trainer_race`, `type`, `type_flags`, ' +
        '`lootid`, `pickpocketloot`, `skinloot`, `PetSpellDataId`, `VehicleId`, `mingold`, `maxgold`, ' +
        '`AIName`, `MovementType`, `HoverHeight`, `HealthModifier`, `ManaModifier`, `ArmorModifier`, `ExperienceModifier`, `RacialLeader`, ' +
        '`movementId`, `RegenHealth`, `mechanic_immune_mask`, `spell_school_immune_mask`, `flags_extra`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
        "(1234, 0, 0, 0, 0, 0, 'Shin', '', '', 0, 1, 1, 0, 0, 0, 1, 1.14286, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0," +
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
      expect(handlerService.isCreatureTemplateUnsaved()).toBe(false);
      page.setInputValueById(field, 3);
      expect(handlerService.isCreatureTemplateUnsaved()).toBe(true);
      page.setInputValueById(field, 0);
      expect(handlerService.isCreatureTemplateUnsaved()).toBe(false);
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
      const values: (string | number)[] = [];
      for (let i = 0; i < Object.keys(originalEntity).length; i++) {
        values[i] = i;
      }
      // selectors
      values[11] = '1: Directions'; // IconName
      values[15] = 1; // exp
      values[24] = 1; // rank
      values[25] = 1; // dmgschool
      values[31] = '0: 1'; // unit_class
      values[35] = 1; // family
      values[36] = 1; // trainer_type
      values[38] = 1; // trainer_class
      values[39] = 1; // trainer_race
      values[40] = 1; // type
      values[50] = 2; // MovementType
      values[56] = 1; // RacialLeader
      values[58] = 0; // RegenHealth

      const expectedQuery =
        'UPDATE `creature_template` ' +
        'SET `difficulty_entry_2` = 1, `difficulty_entry_3` = 2, `KillCredit1` = 3, `KillCredit2` = 4,' +
        " `name` = '5', `subname` = '6', `gossip_menu_id` = 8, `minlevel` = 9, `maxlevel` = 10, " +
        '`faction` = 12, `npcflag` = 13, `speed_walk` = 14, `speed_run` = 15, `speed_swim` = 16, ' +
        '`speed_flight` = 17, `detection_range` = 18, `scale` = 19, `DamageModifier` = 22, ' +
        '`BaseAttackTime` = 23, `RangeAttackTime` = 24, `BaseVariance` = 25, `RangeVariance` = 26, ' +
        '`unit_flags` = 28, `unit_flags2` = 29, `dynamicflags` = 30, `trainer_spell` = 33, ' +
        '`trainer_race` = 1, `type_flags` = 37, `lootid` = 38, `pickpocketloot` = 39, `skinloot` = 40,' +
        " `PetSpellDataId` = 41, `VehicleId` = 42, `mingold` = 43, `maxgold` = 44, `AIName` = '45', " +
        '`HoverHeight` = 47, `HealthModifier` = 48, `ManaModifier` = 49, `ArmorModifier` = 50, ' +
        '`ExperienceModifier` = 51, `movementId` = 53, `mechanic_immune_mask` = 55, ' +
        "`spell_school_immune_mask` = 56, `flags_extra` = 57, `ScriptName` = '58' WHERE (`entry` = 1234);";

      querySpy.calls.reset();

      page.changeAllFields(originalEntity, ['VerifiedBuild'], values);
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

    xit('changing a value via FlagsSelector should correctly work', waitForAsync(async () => {
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
    }));
  });
});
