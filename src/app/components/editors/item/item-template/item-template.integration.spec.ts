import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import Spy = jasmine.Spy;

import { ItemTemplateComponent } from './item-template.component';
import { ItemTemplateModule } from './item-template.module';
import { QueryService } from '../../../../services/query.service';
import { EditorPageObject } from '../../../../test-utils/editor-page-object';
import { ItemTemplate } from '../../../../types/item-template.type';
import { ItemHandlerService } from '../../../../services/handlers/item-handler.service';
import { ITEM_SUBCLASS } from '../../../../constants/options/item-class';

class ItemTemplatePage extends EditorPageObject<ItemTemplateComponent> {}

describe('ItemTemplate integration tests', () => {
  let component: ItemTemplateComponent;
  let fixture: ComponentFixture<ItemTemplateComponent>;
  let queryService: QueryService;
  let querySpy: Spy;
  let handlerService: ItemHandlerService;
  let page: ItemTemplatePage;

  const id = 1234;
  const expectedFullCreateQuery = 'DELETE FROM `item_template` WHERE (`entry` = 1234);\n' +
    'INSERT INTO `item_template` (`entry`, `class`, `subclass`, `SoundOverrideSubclass`, `name`, `displayid`, `Quality`, ' +
    '`Flags`, `FlagsExtra`, `BuyCount`, `BuyPrice`, `SellPrice`, `InventoryType`, `AllowableClass`, `AllowableRace`, ' +
    '`ItemLevel`, `RequiredLevel`, `RequiredSkill`, `RequiredSkillRank`, `requiredspell`, `requiredhonorrank`, ' +
    '`RequiredCityRank`, `RequiredReputationFaction`, `RequiredReputationRank`, `maxcount`, `stackable`, `ContainerSlots`, ' +
    '`StatsCount`, `stat_type1`, `stat_value1`, `stat_type2`, `stat_value2`, `stat_type3`, `stat_value3`, ' +
    '`stat_type4`, `stat_value4`, `stat_type5`, `stat_value5`, `stat_type6`, `stat_value6`, `stat_type7`, `stat_value7`, ' +
    '`stat_type8`, `stat_value8`, `stat_type9`, `stat_value9`, `stat_type10`, `stat_value10`, `ScalingStatDistribution`, ' +
    '`ScalingStatValue`, `dmg_min1`, `dmg_max1`, `dmg_type1`, `dmg_min2`, `dmg_max2`, `dmg_type2`, `armor`, `holy_res`, ' +
    '`fire_res`, `nature_res`, `frost_res`, `shadow_res`, `arcane_res`, `delay`, `ammo_type`, `RangedModRange`, `spellid_1`, ' +
    '`spelltrigger_1`, `spellcharges_1`, `spellppmRate_1`, `spellcooldown_1`, `spellcategory_1`, `spellcategorycooldown_1`, ' +
    '`spellid_2`, `spelltrigger_2`, `spellcharges_2`, `spellppmRate_2`, `spellcooldown_2`, `spellcategory_2`, ' +
    '`spellcategorycooldown_2`, `spellid_3`, `spelltrigger_3`, `spellcharges_3`, `spellppmRate_3`, `spellcooldown_3`, ' +
    '`spellcategory_3`, `spellcategorycooldown_3`, `spellid_4`, `spelltrigger_4`, `spellcharges_4`, `spellppmRate_4`, ' +
    '`spellcooldown_4`, `spellcategory_4`, `spellcategorycooldown_4`, `spellid_5`, `spelltrigger_5`, `spellcharges_5`, ' +
    '`spellppmRate_5`, `spellcooldown_5`, `spellcategory_5`, `spellcategorycooldown_5`, `bonding`, `description`, `PageText`, ' +
    '`LanguageID`, `PageMaterial`, `startquest`, `lockid`, `Material`, `sheath`, `RandomProperty`, `RandomSuffix`, `block`, ' +
    '`itemset`, `MaxDurability`, `area`, `Map`, `BagFamily`, `TotemCategory`, `socketColor_1`, `socketContent_1`, `socketColor_2`, ' +
    '`socketContent_2`, `socketColor_3`, `socketContent_3`, `socketBonus`, `GemProperties`, `RequiredDisenchantSkill`, ' +
    '`ArmorDamageModifier`, `duration`, `ItemLimitCategory`, `HolidayId`, `ScriptName`, `DisenchantID`, `FoodType`, ' +
    '`minMoneyLoot`, `maxMoneyLoot`, `flagsCustom`, `VerifiedBuild`) VALUES\n' +
    '(1234, 0, 0, -1, \'\', 0, 0, 0, 0, 1, 0, 0, 0, -1, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ' +
    '0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1000, 0, 0, 0, 0, 0, 0, -1, 0, -1, 0, 0, 0, 0, -1, ' +
    '0, -1, 0, 0, 0, 0, -1, 0, -1, 0, 0, 0, 0, -1, 0, -1, 0, 0, 0, 0, -1, 0, -1, 0, \'\', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ' +
    '0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, \'\', 0, 0, 0, 0, 0, 0);\n';

  const originalEntity = new ItemTemplate();
  originalEntity.entry = id;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ItemTemplateModule,
        RouterTestingModule,
      ],
    })
      .compileComponents();
  }));

  function setup(creatingNew: boolean) {
    handlerService = TestBed.get(ItemHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    queryService = TestBed.get(QueryService);
    querySpy = spyOn(queryService, 'query').and.returnValue(of());

    spyOn(queryService, 'selectAll').and.returnValue(of(
      { results: creatingNew ? [] : [originalEntity] }
    ));

    fixture = TestBed.createComponent(ItemTemplateComponent);
    component = fixture.componentInstance;
    page = new ItemTemplatePage(fixture);
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
      querySpy.calls.reset();

      page.setInputValueById('name', 'Shin');
      page.clickExecuteQuery();

      // Note: full query check has been shortened here because the table is too big, don't do this in other tests unless necessary
      page.expectFullQueryToContain('Shin');
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain('Shin');
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
      const expectedQuery = 'UPDATE `item_template` SET ' +
        '`subclass` = 1, `SoundOverrideSubclass` = 2, `name` = \'3\', `displayid` = 4, `Quality` = 5, `Flags` = 6, `FlagsExtra` = 7, ' +
        '`BuyCount` = 8, `BuyPrice` = 9, `SellPrice` = 10, `InventoryType` = 11, `AllowableClass` = 12, `AllowableRace` = 13, ' +
        '`ItemLevel` = 14, `RequiredLevel` = 15, `RequiredSkill` = 16, `RequiredSkillRank` = 17, `requiredspell` = 18, ' +
        '`requiredhonorrank` = 19, `RequiredCityRank` = 20, `RequiredReputationFaction` = 21, `RequiredReputationRank` = 22, ' +
        '`maxcount` = 23, `stackable` = 24, `ContainerSlots` = 25, `StatsCount` = 26, `stat_type1` = 27, `stat_value1` = 28, ' +
        '`stat_type2` = 29, `stat_value2` = 30, `stat_type3` = 31, `stat_value3` = 32, `stat_type4` = 33, `stat_value4` = 34, ' +
        '`stat_type5` = 35, `stat_value5` = 36, `stat_type6` = 37, `stat_value6` = 38, `stat_type7` = 39, `stat_value7` = 40, ' +
        '`stat_type8` = 41, `stat_value8` = 42, `stat_type9` = 43, `stat_value9` = 44, `stat_type10` = 45, `stat_value10` = 46, ' +
        '`ScalingStatDistribution` = 47, `ScalingStatValue` = 48, `dmg_min1` = 49, `dmg_max1` = 50, `dmg_type1` = 51, ' +
        '`dmg_min2` = 52, `dmg_max2` = 53, `dmg_type2` = 54, `armor` = 55, `holy_res` = 56, `fire_res` = 57, `nature_res` = 58, ' +
        '`frost_res` = 59, `shadow_res` = 60, `arcane_res` = 61, `delay` = 62, `ammo_type` = 63, `RangedModRange` = 64, ' +
        '`spellid_1` = 65, `spelltrigger_1` = 66, `spellcharges_1` = 67, `spellppmRate_1` = 68, `spellcooldown_1` = 69, ' +
        '`spellcategory_1` = 70, `spellcategorycooldown_1` = 71, `spellid_2` = 72, `spelltrigger_2` = 73, `spellcharges_2` = 74, ' +
        '`spellppmRate_2` = 75, `spellcooldown_2` = 76, `spellcategory_2` = 77, `spellcategorycooldown_2` = 78, `spellid_3` = 79, ' +
        '`spelltrigger_3` = 80, `spellcharges_3` = 81, `spellppmRate_3` = 82, `spellcooldown_3` = 83, `spellcategory_3` = 84, ' +
        '`spellcategorycooldown_3` = 85, `spellid_4` = 86, `spelltrigger_4` = 87, `spellcharges_4` = 88, `spellppmRate_4` = 89, ' +
        '`spellcooldown_4` = 90, `spellcategory_4` = 91, `spellcategorycooldown_4` = 92, `spellid_5` = 93, `spelltrigger_5` = 94, ' +
        '`spellcharges_5` = 95, `spellppmRate_5` = 96, `spellcooldown_5` = 97, `spellcategory_5` = 98, ' +
        '`spellcategorycooldown_5` = 99, `bonding` = 100, `description` = \'101\', `PageText` = 102, `LanguageID` = 103, ' +
        '`PageMaterial` = 104, `startquest` = 105, `lockid` = 106, `Material` = 107, `sheath` = 108, `RandomProperty` = 109, ' +
        '`RandomSuffix` = 110, `block` = 111, `itemset` = 112, `MaxDurability` = 113, `area` = 114, `Map` = 115, `BagFamily` = 116, ' +
        '`TotemCategory` = 117, `socketColor_1` = 118, `socketContent_1` = 119, `socketColor_2` = 120, `socketContent_2` = 121, ' +
        '`socketColor_3` = 122, `socketContent_3` = 123, `socketBonus` = 124, `GemProperties` = 125, `RequiredDisenchantSkill` = 126, ' +
        '`ArmorDamageModifier` = 127, `duration` = 128, `ItemLimitCategory` = 129, `HolidayId` = 130, `ScriptName` = \'131\', ' +
        '`DisenchantID` = 132, `FoodType` = 133, `minMoneyLoot` = 134, `maxMoneyLoot` = 135, `flagsCustom` = 136 WHERE (`entry` = 1234);';
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
        'UPDATE `item_template` SET `name` = \'Shin\' WHERE (`entry` = 1234);'
      );
      page.expectFullQueryToContain('Shin');

      page.setInputValueById('BuyCount', 22);
      page.expectDiffQueryToContain(
        'UPDATE `item_template` SET `name` = \'Shin\', `BuyCount` = 22 WHERE (`entry` = 1234);'
      );
      page.expectFullQueryToContain('Shin');
      page.expectFullQueryToContain('22');
    });

    it('changing a value via FlagsSelector should correctly work', () => {
      const field = 'Flags';
      page.clickElement(page.getSelectorBtn(field));
      page.expectModalDisplayed();

      page.toggleFlagInRow(2);
      page.toggleFlagInRow(12);
      page.clickModalSelect();

      expect(page.getInputById(field).value).toEqual('4100');
      page.expectDiffQueryToContain(
        'UPDATE `item_template` SET `Flags` = 4100 WHERE (`entry` = 1234);'
      );

      // Note: full query check has been shortened here because the table is too big, don't do this in other tests unless necessary
      page.expectFullQueryToContain('4100');
    });

    describe('the subclass field', () => {
      it('should show the selector button only if class has a valid value', () => {
        page.setInputValueById('class', 100);
        expect(page.getSelectorBtn('subclass', false)).toBeFalsy();

        page.setInputValueById('class', 0);
        expect(page.getSelectorBtn('subclass', false)).toBeTruthy();

        page.setInputValueById('class', -1);
        expect(page.getSelectorBtn('subclass', false)).toBeFalsy();

        page.setInputValueById('class', 10);
        expect(page.getSelectorBtn('subclass', false)).toBeTruthy();

        page.setInputValueById('class', null);
        expect(page.getSelectorBtn('subclass', false)).toBeFalsy();
      });

      it('should show its values according to the value of class', () => {
        page.setInputValueById('class', 3);
        page.clickElement(page.getSelectorBtn('subclass'));

        expect(page.getCellOfDatatableInModal(2, 1).innerText).toContain(ITEM_SUBCLASS[3][2].name);
        page.clickModalSelect();
      });
    });
  });
});

