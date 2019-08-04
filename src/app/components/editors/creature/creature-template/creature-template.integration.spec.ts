import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import Spy = jasmine.Spy;

import { CreatureTemplateComponent } from './creature-template.component';
import { CreatureTemplateModule } from './creature-template.module';
import { QueryService } from '../../../../services/query.service';
import { EditorPageObject } from '../../../../test-utils/editor-page-object';
import { CreatureTemplate } from '../../../../types/creature-template.type';
import { CreatureHandlerService } from '../../../../services/handlers/creature-handler.service';

class CreatureTemplatePage extends EditorPageObject<CreatureTemplateComponent> {}

describe('CreatureTemplate integration tests', () => {
  let component: CreatureTemplateComponent;
  let fixture: ComponentFixture<CreatureTemplateComponent>;
  let queryService: QueryService;
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
    ' `resistance1`, `resistance2`, `resistance3`, `resistance4`, `resistance5`, `resistance6`,' +
    ' `spell1`, `spell2`, `spell3`, `spell4`, `spell5`, `spell6`, `spell7`, `spell8`, `PetSpellDataId`,' +
    ' `VehicleId`, `mingold`, `maxgold`, `AIName`, `MovementType`, `InhabitType`, `HoverHeight`,' +
    ' `HealthModifier`, `ManaModifier`, `ArmorModifier`, `RacialLeader`, `movementId`, `RegenHealth`,' +
    ' `mechanic_immune_mask`, `flags_extra`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
    '(1234, 0, 0, 0, 0, 0, 0, 0, 0, 0, \'\', \'\', \'\', 0, 1, 1, 0, 0, 0, 1, 1.14286, 1, 0, 0, 0,' +
    ' 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,' +
    ' 0, 0, 0, 0, 0, 0, \'\', 0, 3, 1, 1, 1, 1, 0, 0, 1, 0, 0, \'\', 0);';

  const originalEntity = new CreatureTemplate();
  originalEntity.entry = id;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CreatureTemplateModule,
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
      ' `resistance1`, `resistance2`, `resistance3`, `resistance4`, `resistance5`, `resistance6`,' +
      ' `spell1`, `spell2`, `spell3`, `spell4`, `spell5`, `spell6`, `spell7`, `spell8`, `PetSpellDataId`,' +
      ' `VehicleId`, `mingold`, `maxgold`, `AIName`, `MovementType`, `InhabitType`, `HoverHeight`,' +
      ' `HealthModifier`, `ManaModifier`, `ArmorModifier`, `RacialLeader`, `movementId`, `RegenHealth`,' +
      ' `mechanic_immune_mask`, `flags_extra`, `ScriptName`, `VerifiedBuild`) VALUES\n' +
      '(1234, 0, 0, 0, 0, 0, 0, 0, 0, 0, \'Shin\', \'\', \'\', 0, 1, 1, 0, 0, 0, 1, 1.14286, 1, 0, 0, 0,' +
      ' 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,' +
      ' 0, 0, 0, 0, 0, 0, \'\', 0, 3, 1, 1, 1, 1, 0, 0, 1, 0, 0, \'\', 0);';
      querySpy.calls.reset();

      page.setInputValueById('name', 'Shin');
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

    it('changing a property and executing the query should correctly work', () => {
      const expectedQuery = 'UPDATE `creature_template` SET `difficulty_entry_1` = 2 WHERE (`entry` = 1234);';
      querySpy.calls.reset();

      page.setInputValueById('difficulty_entry_1', 2);
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

    it('changing a value via FlagsSelector should correctly work', () => {
      const field = 'unit_flags';
      page.clickElement(page.getSelectorBtn(field));
      page.expectModalDisplayed();

      page.toggleFlagInRow(2);
      page.toggleFlagInRow(12);
      page.clickModalSelect();

      expect(page.getInputById(field).value).toEqual('4100');
      page.expectDiffQueryToContain(
        'UPDATE `creature_template` SET `unit_flags` = 4100 WHERE (`entry` = 1234);'
      );

      // Note: full query check has been shortened here because the table is too big, don't do this in other tests unless necessary
      page.expectFullQueryToContain('4100');
    });
  });
});

