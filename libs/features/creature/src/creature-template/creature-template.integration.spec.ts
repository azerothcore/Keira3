import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
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

class CreatureTemplatePage extends EditorPageObject<CreatureTemplateComponent> {}

describe('CreatureTemplate integration tests', () => {
  const id = 1234;
  const expectedFullCreateQuery =
    'DELETE FROM `creature_template` WHERE (`entry` = 1234);\n' +
    'INSERT INTO `creature_template` (`entry`, `difficulty_entry_1`, `difficulty_entry_2`, `difficulty_entry_3`, ' +
    '`KillCredit1`, `KillCredit2`, `name`, `subname`, ' +
    '`IconName`, `gossip_menu_id`, `minlevel`, `maxlevel`, `exp`, `faction`, `npcflag`, `speed_walk`, `speed_run`, `speed_swim`, `speed_flight`, `detection_range`, ' +
    '`rank`, `dmgschool`, `DamageModifier`, `BaseAttackTime`, `RangeAttackTime`, `BaseVariance`, `RangeVariance`, ' +
    '`unit_class`, `unit_flags`, `unit_flags2`, `dynamicflags`, `family`, ' +
    '`type`, `type_flags`, `lootid`, `pickpocketloot`, `skinloot`, `PetSpellDataId`, `VehicleId`, `mingold`, ' +
    '`maxgold`, `AIName`, `MovementType`, `HoverHeight`, `HealthModifier`, `ManaModifier`, `ArmorModifier`, `ExperienceModifier`, ' +
    '`RacialLeader`, `movementId`, `RegenHealth`, `CreatureImmunitiesId`, ' +
    '`flags_extra`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
    "(1234, 0, 0, 0, 0, 0, '', '', '', 0, 1, 1, 0, 0, 0, 1, 1.14286, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, " +
    "0, 0, 0, 0, 0, 0, 0, 0, '', 0, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, '', 0);\n";

  const originalEntity = new CreatureTemplate();
  originalEntity.entry = id;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), ModalModule.forRoot(), CreatureTemplateComponent, RouterTestingModule, TranslateTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: KEIRA_APP_CONFIG_TOKEN, useValue: KEIRA_MOCK_CONFIG },
        CreatureHandlerService,
        SaiCreatureHandlerService,
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
  });

  function setup(creatingNew: boolean) {
    const handlerService = TestBed.inject(CreatureHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    const queryService = TestBed.inject(MysqlQueryService);
    const querySpy = spyOn(queryService, 'query').and.returnValue(of([]));

    spyOn(queryService, 'selectAll').and.returnValue(of(creatingNew ? [] : [originalEntity]));

    const fixture = TestBed.createComponent(CreatureTemplateComponent);
    const page = new CreatureTemplatePage(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();
    return { fixture, queryService, querySpy, handlerService, page };
  }

  describe('Creating new', () => {
    it('should correctly initialise', () => {
      const { page } = setup(true);
      page.expectQuerySwitchToBeHidden();
      page.expectFullQueryToBeShown();
      page.expectFullQueryToContain(expectedFullCreateQuery);
    });

    it('changing a property and executing the query should correctly work', () => {
      const { querySpy, page } = setup(true);
      const expectedQuery =
        'DELETE FROM `creature_template` WHERE (`entry` = 1234);\n' +
        'INSERT INTO `creature_template` (`entry`, `difficulty_entry_1`, `difficulty_entry_2`, `difficulty_entry_3`, ' +
        '`KillCredit1`, `KillCredit2`, `name`, `subname`, `IconName`, ' +
        '`gossip_menu_id`, `minlevel`, `maxlevel`, `exp`, `faction`, `npcflag`, `speed_walk`, `speed_run`, `speed_swim`, `speed_flight`, `detection_range`, ' +
        '`rank`, `dmgschool`, `DamageModifier`, `BaseAttackTime`, `RangeAttackTime`, `BaseVariance`, ' +
        '`RangeVariance`, `unit_class`, `unit_flags`, `unit_flags2`, `dynamicflags`, `family`, ' +
        '`type`, `type_flags`, ' +
        '`lootid`, `pickpocketloot`, `skinloot`, `PetSpellDataId`, `VehicleId`, `mingold`, `maxgold`, ' +
        '`AIName`, `MovementType`, `HoverHeight`, `HealthModifier`, `ManaModifier`, `ArmorModifier`, `ExperienceModifier`, `RacialLeader`, ' +
        '`movementId`, `RegenHealth`, `CreatureImmunitiesId`, `flags_extra`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
        "(1234, 0, 0, 0, 0, 0, 'Shin', '', '', 0, 1, 1, 0, 0, 0, 1, 1.14286, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0," +
        " 0, 0, 0, 0, 0, 0, 0, 0, '', 0, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, '', 0);";

      querySpy.calls.reset();

      page.setInputValueById('name', 'Shin');
      page.expectFullQueryToContain(expectedQuery);

      page.clickExecuteQuery();

      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
    });

    it('should correctly update the unsaved status', () => {
      const { handlerService, page } = setup(true);
      const field = 'difficulty_entry_1';
      expect(handlerService.isCreatureTemplateUnsaved()).toBe(false);
      page.setInputValueById(field, 3);
      expect(handlerService.isCreatureTemplateUnsaved()).toBe(true);
      page.setInputValueById(field, 0);
      expect(handlerService.isCreatureTemplateUnsaved()).toBe(false);
    });
  });

  describe('Editing existing', () => {
    it('should correctly initialise', () => {
      const { page } = setup(false);
      page.expectDiffQueryToBeShown();
      page.expectDiffQueryToBeEmpty();
      page.expectFullQueryToContain(expectedFullCreateQuery);
    });

    it('changing all properties and executing the query should correctly work', async () => {
      const { querySpy, page } = setup(false);
      const values: (string | number)[] = [];
      for (let i = 0; i < Object.keys(originalEntity).length; i++) {
        values[i] = i;
      }

      // selectors
      await page.setNgxSelectValueByIndex('IconName', 1);
      values[11] = 1; // exp
      values[19] = 1; // rank
      values[20] = 1; // dmgschool
      await page.setNgxSelectValueByIndex('unit_class', 1);
      values[30] = 1; // family
      values[31] = 1; // type
      values[41] = 2; // MovementType
      values[47] = 1; // RacialLeader
      values[49] = 0; // RegenHealth

      const expectedQuery =
        'UPDATE `creature_template` ' +
        'SET `difficulty_entry_2` = 1, `difficulty_entry_3` = 2, `KillCredit1` = 3, `KillCredit2` = 4,' +
        " `name` = '5', `subname` = '6', `IconName` = 'Directions', `gossip_menu_id` = 8, `minlevel` = 9, `maxlevel` = 10, " +
        '`faction` = 12, `npcflag` = 13, `speed_walk` = 14, `speed_run` = 15, `speed_swim` = 16, ' +
        '`speed_flight` = 17, `detection_range` = 18, `DamageModifier` = 21, ' +
        '`BaseAttackTime` = 22, `RangeAttackTime` = 23, `BaseVariance` = 24, `RangeVariance` = 25, `unit_class` = 2, ' +
        '`unit_flags` = 27, `unit_flags2` = 28, `dynamicflags` = 29, ' +
        '`type_flags` = 32, `lootid` = 33, `pickpocketloot` = 34, `skinloot` = 35,' +
        " `PetSpellDataId` = 36, `VehicleId` = 37, `mingold` = 38, `maxgold` = 39, `AIName` = '40', " +
        '`HoverHeight` = 42, `HealthModifier` = 43, `ManaModifier` = 44, `ArmorModifier` = 45, ' +
        '`ExperienceModifier` = 46, `movementId` = 48, `CreatureImmunitiesId` = 50, ' +
        "`flags_extra` = 51, `ScriptName` = '52' WHERE (`entry` = 1234);";

      querySpy.calls.reset();

      page.changeAllFields(originalEntity, ['VerifiedBuild'], values);
      page.expectDiffQueryToContain(expectedQuery);

      page.clickExecuteQuery();
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
    });

    it('changing values should correctly update the queries', () => {
      const { page } = setup(false);
      // Note: full query check has been shortened here because the table is too big, don't do this in other tests unless necessary

      page.setInputValueById('name', 'Shin');
      page.expectDiffQueryToContain("UPDATE `creature_template` SET `name` = 'Shin' WHERE (`entry` = 1234);");
      page.expectFullQueryToContain('Shin');

      page.setInputValueById('subname', 'AC Developer');
      page.expectDiffQueryToContain("UPDATE `creature_template` SET `name` = 'Shin', `subname` = 'AC Developer' WHERE (`entry` = 1234);");
      page.expectFullQueryToContain('Shin');
      page.expectFullQueryToContain('AC Developer');
    });

    xit('changing a value via FlagsSelector should correctly work', async () => {
      const { page } = setup(false);
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
    });
  });
});
